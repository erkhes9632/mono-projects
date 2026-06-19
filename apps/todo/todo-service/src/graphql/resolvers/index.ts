import * as Query from './queries';
import * as Mutation from './mutations';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getTodos: Query.getTodos,
  },
  Mutation: {
    createUser: Mutation.createUser,
    createTodo: Mutation.createTodo,
    completeTodo: Mutation.completeTodo,
    deleteUser: Mutation.deleteUser,
    deleteTodo: Mutation.deleteTodo,
  },
};
