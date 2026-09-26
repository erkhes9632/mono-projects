import { queries } from './queries';
import { mutations } from './mutations';
import { userResolvers, goalResolvers, objectiveResolvers } from './user';

export const resolvers = {
  Query: queries,
  Mutation: mutations,
  User: userResolvers,
  Goal: goalResolvers,
  Objective: objectiveResolvers,
};
