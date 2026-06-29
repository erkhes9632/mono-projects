import gql from 'graphql-tag';

export const usertypeDefs = gql`
  enum Role {
    STUDENT
    TEACHER
  }

  type User {
    id: ID!
    userName: String!
    email: String!
    avatarUrl: String
    age: Int
    role: Role!
    coinBalance: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Response {
    message: String!
  }

  input UserInput {
    userName: String!
    email: String!
    avatarUrl: String
    age: Int
  }

  type Query {
    getUsers: [User!]!
  }

  type Mutation {
    createUser(input: UserInput): Response!
  }
`;
