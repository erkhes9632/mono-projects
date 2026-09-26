import { GraphQLError } from 'graphql';
import { eq } from 'drizzle-orm';
import { goals } from '../../../db';
import { GraphQLContext, GoalStatus } from '../../../types';

export async function getMyGoals(
  _: unknown,
  __: unknown,
  ctx: GraphQLContext,
) {
  if (!ctx.userId) {
    throw new GraphQLError('Unauthorized');
  }

  const rows = await ctx.db
    .select()
    .from(goals)
    .where(eq(goals.userId, ctx.userId));

  return rows.map((row) => ({
    ...row,
    status: (row.status || 'ACTIVE') as GoalStatus,
    progressPercent: row.progressPercent ?? 0,
  }));
}
