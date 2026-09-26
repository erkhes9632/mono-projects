import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { goals, objectives, tasks } from '../../../db';
import { GraphQLContext } from '../../../types';
import { GoalStatus, ObjectiveStatus } from '../../../types';

export async function getGoalTree(
  _: unknown,
  { goalId }: { goalId: string },
  ctx: GraphQLContext,
): Promise<any> {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  const [goal] = await ctx.db.select().from(goals).where(eq(goals.id, goalId));

  if (!goal) {
    return null;
  }

  if (!ctx.isService && goal.userId !== ctx.userId) {
    throw new GraphQLError('Forbidden: not your goal');
  }

  const goalObjectives = await ctx.db
    .select()
    .from(objectives)
    .where(eq(objectives.goalId, goalId));

  const objectivesWithTasks = await Promise.all(
    goalObjectives.map(async (obj) => {
      const objTasks = await ctx.db
        .select()
        .from(tasks)
        .where(eq(tasks.objectiveId, obj.id));
      return { ...obj, tasks: objTasks };
    }),
  );

  return {
    ...goal,
    status: (goal.status || 'ACTIVE') as GoalStatus,
    progressPercent: goal.progressPercent ?? 0,
    objectives: objectivesWithTasks.map((obj) => ({
      ...obj,
      status: (obj.status || 'PENDING') as ObjectiveStatus,
      progressPercent: obj.progressPercent ?? 0,
    })),
  };
}
