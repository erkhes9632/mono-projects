import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { users } from '../../../db';
import { GraphQLContext } from '../../../types';

export async function getUser(
  _: unknown,
  { id }: { id: string },
  ctx: GraphQLContext,
) {
  if (!ctx.isService && !ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  if (!ctx.isService && ctx.userId !== id) {
    throw new GraphQLError('Forbidden: cannot read other users');
  }

  const [found] = await ctx.db.select().from(users).where(eq(users.id, id));
  return found || null;
}
