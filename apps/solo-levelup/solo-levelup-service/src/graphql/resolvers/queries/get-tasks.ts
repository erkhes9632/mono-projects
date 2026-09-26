import { and, eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { tasks, objectives, goals } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function getTasks(
  _: unknown,
  { scheduledDate }: { scheduledDate: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService && !ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  if (ctx.isService) {
    return ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.scheduledDate, scheduledDate));
  }

  return ctx.db
    .select({
      id: tasks.id,
      objectiveId: tasks.objectiveId,
      title: tasks.title,
      description: tasks.description,
      acceptanceCriteria: tasks.acceptanceCriteria,
      scheduledDate: tasks.scheduledDate,
      scheduledTime: tasks.scheduledTime,
      status: tasks.status,
      telegramMessageId: tasks.telegramMessageId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .innerJoin(objectives, eq(tasks.objectiveId, objectives.id))
    .innerJoin(goals, eq(objectives.goalId, goals.id))
    .where(
      and(
        eq(tasks.scheduledDate, scheduledDate),
        eq(goals.userId, ctx.userId as string),
      ),
    );
}
