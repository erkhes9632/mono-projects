import { GraphQLError } from 'graphql';
import { eq, and, desc } from 'drizzle-orm';
import { tasks, objectives, goals, users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function getActiveTaskForChat(
  _: unknown,
  { chatId }: { chatId: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const [user] = await ctx.db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, chatId));

  if (!user) {
    return null;
  }

  const [activeTask] = await ctx.db
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
    .where(and(eq(goals.userId, user.id), eq(tasks.status, 'SENT')))
    .orderBy(desc(tasks.updatedAt))
    .limit(1);

  return activeTask || null;
}
