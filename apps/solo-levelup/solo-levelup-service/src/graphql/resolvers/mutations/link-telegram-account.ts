import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function linkTelegramAccount(
  _: unknown,
  args: { code: string; chatId: string; username: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService && !ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  let existing;
  if (ctx.isService) {
    [existing] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.linkCode, args.code));
  } else {
    [existing] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.userId!));
  }

  if (!existing) {
    throw new GraphQLError('User not found with the given link code');
  }

  const [conflict] = await ctx.db
    .select()
    .from(users)
    .where(eq(users.telegramChatId, args.chatId));

  if (conflict && conflict.id !== existing.id) {
    throw new GraphQLError('Telegram account already linked to another user');
  }

  const [updated] = await ctx.db
    .update(users)
    .set({
      telegramChatId: args.chatId,
      telegramUsername: args.username,
      linkCode: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id))
    .returning();

  return updated;
}
