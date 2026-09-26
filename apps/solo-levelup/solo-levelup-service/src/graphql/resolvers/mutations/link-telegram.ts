import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function linkTelegram(
  _: unknown,
  args: { telegramChatId: string; telegramUsername: string },
  ctx: GraphQLContext,
) {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  const existing = await ctx.db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, args.telegramChatId));

  if (existing.length > 0 && existing[0].id !== ctx.userId) {
    throw new GraphQLError('Telegram account already linked to another user');
  }

  const linkCode = crypto.randomUUID().slice(0, 8);
  const [updated] = await ctx.db
    .update(users)
    .set({
      telegramChatId: args.telegramChatId,
      telegramUsername: args.telegramUsername,
      linkCode,
      updatedAt: new Date(),
    })
    .where(eq(users.id, ctx.userId))
    .returning();

  if (!updated) {
    throw new GraphQLError('User not found');
  }

  return updated;
}
