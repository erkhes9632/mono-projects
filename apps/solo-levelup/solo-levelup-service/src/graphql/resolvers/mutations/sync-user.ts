import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function syncUser(_: unknown, __: unknown, ctx: GraphQLContext) {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized: must be signed in');
  }

  const [existing] = await ctx.db
    .select()
    .from(users)
    .where(eq(users.id, ctx.userId));

  if (existing) {
    if (ctx.userEmail && existing.email !== ctx.userEmail) {
      const [updated] = await ctx.db
        .update(users)
        .set({
          email: ctx.userEmail,
          userName: existing.userName || ctx.userEmail.split('@')[0] || 'User',
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.userId))
        .returning();
      return updated;
    }
    return existing;
  }

  const id = ctx.userId;
  const userName = ctx.userEmail?.split('@')[0] || 'User';
  const email = ctx.userEmail || null;

  try {
    const [inserted] = await ctx.db
      .insert(users)
      .values({ id, userName, email })
      .onConflictDoUpdate({
        target: users.id,
        set: { userName, email },
      })
      .returning();

    console.log(`[SyncUser] Created/updated user ${id}`);
    return inserted;
  } catch (dbError) {
    console.error('[SyncUser] Database error:', dbError);
    throw new GraphQLError('Failed to sync user to database');
  }
}
