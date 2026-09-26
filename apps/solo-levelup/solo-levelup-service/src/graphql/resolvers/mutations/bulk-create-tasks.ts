import { GraphQLError } from 'graphql';
import { tasks } from '../../../db';
import { GraphQLContext, TaskInput } from '../../../types';

export async function bulkCreateTasks(
  _: unknown,
  { objectiveId, tasks: list }: { objectiveId: string; tasks: TaskInput[] },
  ctx: GraphQLContext,
) {
  if (!ctx.isService) {
    throw new GraphQLError('Unauthorized: Service key required');
  }

  const values = list.map((item) => ({
    id: crypto.randomUUID(),
    objectiveId,
    title: item.title,
    description: item.description,
    acceptanceCriteria: item.acceptanceCriteria,
    scheduledDate: item.scheduledDate,
    scheduledTime: item.scheduledTime ?? '09:00',
  }));

  return ctx.db.insert(tasks).values(values).returning();
}
