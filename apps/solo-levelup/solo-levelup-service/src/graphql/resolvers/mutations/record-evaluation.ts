import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import {
  evaluations,
  submissions,
  tasks,
  objectives,
  goals,
} from '../../../db';
import { GraphQLContext } from '../../../types';

type Verdict = 'DONE' | 'NOT_DONE';

export async function recordEvaluation(
  _: unknown,
  args: {
    submissionId: string;
    verdict: 'DONE' | 'NOT_DONE';
    aiFeedback?: string;
    aiScore?: number;
  },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const verdict: Verdict = args.verdict;

  const [submission] = await ctx.db
    .select()
    .from(submissions)
    .where(eq(submissions.id, args.submissionId));

  if (!submission) {
    throw new GraphQLError('Submission not found');
  }

  const id = crypto.randomUUID();
  const [inserted] = await ctx.db
    .insert(evaluations)
    .values({
      id,
      submissionId: args.submissionId,
      verdict: verdict as 'DONE' | 'NOT_DONE',
      aiFeedback: args.aiFeedback || null,
      aiScore: args.aiScore ?? 0,
    })
    .returning();

  const newTaskStatus = args.verdict === 'DONE' ? 'DONE' : 'FAILED';
  await ctx.db
    .update(tasks)
    .set({ status: newTaskStatus, updatedAt: new Date() })
    .where(eq(tasks.id, submission.taskId));

  const [task] = await ctx.db
    .select()
    .from(tasks)
    .where(eq(tasks.id, submission.taskId));

  if (task) {
    await recalculateProgress(ctx, task.objectiveId);
  }

  return inserted;
}

async function recalculateProgress(ctx: GraphQLContext, objectiveId: string) {
  const allTasks = await ctx.db
    .select({ status: tasks.status })
    .from(tasks)
    .where(eq(tasks.objectiveId, objectiveId));

  const total = allTasks.length;
  const done = allTasks.filter((t) => t.status === 'DONE').length;
  const objectiveProgress = total > 0 ? Math.round((done / total) * 100) : 0;

  let objectiveStatus: 'PENDING' | 'IN_PROGRESS' | 'DONE' = 'PENDING';
  if (objectiveProgress === 100) {
    objectiveStatus = 'DONE';
  } else if (objectiveProgress > 0) {
    objectiveStatus = 'IN_PROGRESS';
  }

  await ctx.db
    .update(objectives)
    .set({
      progressPercent: objectiveProgress,
      status: objectiveStatus,
      updatedAt: new Date(),
    })
    .where(eq(objectives.id, objectiveId));

  const [objective] = await ctx.db
    .select()
    .from(objectives)
    .where(eq(objectives.id, objectiveId));

  if (!objective) return;

  const allObjectives = await ctx.db
    .select({ progressPercent: objectives.progressPercent })
    .from(objectives)
    .where(eq(objectives.goalId, objective.goalId));

  const objTotal = allObjectives.length;
  const objSum = allObjectives.reduce((acc, o) => acc + o.progressPercent, 0);
  const goalProgress = objTotal > 0 ? Math.round(objSum / objTotal) : 0;

  let goalStatus: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' = 'ACTIVE';
  if (goalProgress === 100) {
    goalStatus = 'COMPLETED';
  }

  await ctx.db
    .update(goals)
    .set({
      progressPercent: goalProgress,
      status: goalStatus,
      updatedAt: new Date(),
    })
    .where(eq(goals.id, objective.goalId));
}
