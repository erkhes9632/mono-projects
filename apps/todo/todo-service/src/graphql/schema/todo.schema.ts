import gql from 'graphql-tag';

export const todoTypeDefs = gql`
  type Todo {
    id: ID!
    title: String!
    description: String
    xpReward: Int!
    isCompleted: Boolean!
    userId: String!
  }

  input TodoInput {
    title: String!
    description: String
    xpReward: Int!
  }

  extend type Query {
    getTodos(userId: ID!): [Todo!]!
  }

  extend type Mutation {
    createTodo(userId: ID!, input: TodoInput!): Response!
    completeTodo(todoId: ID!): Response!
    deleteTodo(id: ID!): Response!
  }
`;
