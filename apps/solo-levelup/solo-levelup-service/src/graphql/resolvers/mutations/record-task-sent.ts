import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { tasks } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function recordTaskSent(
  _: unknown,
  args: { taskId: string; telegramMessageId: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const [existing] = await ctx.db
    .select()
    .from(tasks)
    .where(eq(tasks.id, args.taskId));

  if (!existing) {
    throw new GraphQLError('Task not found');
  }

  const [updated] = await ctx.db
    .update(tasks)
    .set({
      status: 'SENT',
      telegramMessageId: args.telegramMessageId,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, args.taskId))
    .returning();

  return updated;
}
