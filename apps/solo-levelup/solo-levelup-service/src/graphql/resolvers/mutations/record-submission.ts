import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { submissions, tasks, objectives, goals } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function recordSubmission(
  _: unknown,
  args: { taskId: string; content: string; telegramMessageId?: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService && !ctx.userId) {
    throw new GraphQLError(
      'Unauthorized: must be signed in or use service key',
    );
  }

  const [task] = await ctx.db
    .select()
    .from(tasks)
    .where(eq(tasks.id, args.taskId));

  if (!task) {
    throw new GraphQLError('Task not found');
  }

  let userId = ctx.userId || '';
  if (!userId && ctx.isService) {
    // Service calls (n8n) resolve userId from the task's objective -> goal chain
    const [objective] = await ctx.db
      .select()
      .from(objectives)
      .where(eq(objectives.id, task.objectiveId));
    if (objective) {
      const [goal] = await ctx.db
        .select()
        .from(goals)
        .where(eq(goals.id, objective.goalId));
      if (goal) {
        userId = goal.userId;
      }
    }
  }

  if (!userId) {
    throw new GraphQLError('Unable to resolve user for this submission');
  }

  const id = crypto.randomUUID();

  const [inserted] = await ctx.db
    .insert(submissions)
    .values({
      id,
      taskId: args.taskId,
      userId,
      content: args.content,
      telegramMessageId: args.telegramMessageId || null,
    })
    .returning();

  await ctx.db
    .update(tasks)
    .set({ status: 'SUBMITTED', updatedAt: new Date() })
    .where(eq(tasks.id, args.taskId));

  return inserted;
}
