import { GraphQLError } from 'graphql';
import { objectives } from '../../../db';
import { GraphQLContext, ObjectiveInput } from '../../../types';

export async function bulkCreateObjectives(
  _: unknown,
  {
    goalId,
    objectives: list,
  }: { goalId: string; objectives: ObjectiveInput[] },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const values = list.map((item) => ({
    id: crypto.randomUUID(),
    goalId,
    title: item.title,
    description: item.description,
    orderIndex: item.orderIndex ?? 0,
  }));

  return ctx.db.insert(objectives).values(values).returning();
}
