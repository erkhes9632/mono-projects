import { GraphQLError } from 'graphql';
import { eq, and } from 'drizzle-orm';
import { tasks, objectives, goals, users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function getTasksDueNow(
  _: unknown,
  { windowMinutes }: { windowMinutes: number },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Compute current time in each user's timezone for accurate dispatch.
  // Since D1 doesn't support timezone-aware queries natively, we fetch all
  // SCHEDULED tasks for today and filter in JS using the user's timezone.
  const rows = await ctx.db
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
      telegramChatId: users.telegramChatId,
      telegramUsername: users.telegramUsername,
      timezone: users.timezone,
    })
    .from(tasks)
    .innerJoin(objectives, eq(tasks.objectiveId, objectives.id))
    .innerJoin(goals, eq(objectives.goalId, goals.id))
    .innerJoin(users, eq(goals.userId, users.id))
    .where(and(eq(tasks.scheduledDate, todayStr), eq(tasks.status, 'SCHEDULED')));

  const result: (typeof rows)[number][] = [];

  for (const row of rows) {
    const tz = row.timezone || 'Asia/Ulaanbaatar';
    const tzNow = new Date().toLocaleString('en-US', { timeZone: tz });
    const tzDate = new Date(tzNow);
    const tzMinutes =
      tzDate.getHours() * 60 + tzDate.getMinutes();

    const [hours, minutes] = row.scheduledTime.split(':').map(Number);
    const taskMinutes = hours * 60 + minutes;
    const windowEnd = tzMinutes + windowMinutes;

    if (taskMinutes >= tzMinutes && taskMinutes <= windowEnd) {
      result.push(row);
    }
  }

  return result;
}
