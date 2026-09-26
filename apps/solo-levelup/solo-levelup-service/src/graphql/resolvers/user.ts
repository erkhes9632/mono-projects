import { eq } from 'drizzle-orm';
import { goals, objectives, tasks } from '../../db';
import { GraphQLContext } from '../../types';

export const userResolvers = {
  goals: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
    return ctx.db.select().from(goals).where(eq(goals.userId, parent.id));
  },
};

export const goalResolvers = {
  objectives: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
    return ctx.db
      .select()
      .from(objectives)
      .where(eq(objectives.goalId, parent.id));
  },
};

export const objectiveResolvers = {
  tasks: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
    return ctx.db
      .select()
      .from(tasks)
      .where(eq(tasks.objectiveId, parent.id));
  },
};
