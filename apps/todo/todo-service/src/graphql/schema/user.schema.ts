import gql from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
    xp: Int!
    level: Int!
    todos: [Todo!]!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  type Response {
    success: Boolean!
    message: String!
  }

  type Query {
    getUsers: [User!]!
    getUserById(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): Response!

    deleteUser(id: ID!): Response!
  }
`;
