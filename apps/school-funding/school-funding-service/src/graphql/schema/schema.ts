import gql from 'graphql-tag';

export const typeDefs = gql`
  # Enums
  enum Role {
    STUDENT
    TEACHER
  }

  enum ProjectStatus {
    PENDING
    APPROVED
    REJECTED
    FUNDED
  }

  enum TransactionType {
    EARN
    STAKE
    REFUND
  }

  # Types
  type User {
    id: ID!
    userName: String!
    email: String!
    avatarUrl: String
    role: Role!
    coinBalance: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: ID!
    title: String!
    description: String!
    images: [String!]!
    creatorId: String!
    status: ProjectStatus!
    reviewedById: String
    totalCoinsCollected: Int!
    createdAt: String!
    updatedAt: String!
    comments: [Comment!]!
  }

  type Funding {
    id: ID!
    projectId: String!
    studentId: String!
    coinAmount: Int!
    createdAt: String!
  }

  type Comment {
    id: ID!
    projectId: String!
    authorId: String!
    content: String!
    createdAt: String!
    updatedAt: String!
  }

  type CoinTransaction {
    id: ID!
    userId: String!
    amount: Int!
    type: TransactionType!
    referenceId: String
    createdAt: String!
  }

  type Notification {
    id: ID!
    userId: String!
    type: String!
    title: String!
    message: String!
    projectId: String
    isRead: Boolean!
    createdAt: String!
  }

  type MutationResponse {
    success: Boolean!
    message: String!
  }

  # Inputs
  input UserInput {
    userName: String!
    email: String!
    avatarUrl: String
  }

  input ProjectInput {
    title: String!
    description: String!
    images: [String!]
    creatorId: String!
  }

  input CommentInput {
    projectId: ID!
    content: String!
  }

  # Queries
  type Query {
    getUsers(searchName: String): [User!]!
    getUserById(id: ID): User
    getProjects(status: ProjectStatus): [Project!]!
    getProjectById(id: ID!): Project
    getMyProjects: [Project!]!
    getProjectComments(projectId: ID!): [Comment!]!
    getUserTransactions(userId: ID!): [CoinTransaction!]!
    getFundedProjects(limit: Int): [Project!]!
    getLeaderboardProjects(limit: Int): [Project!]!
    getUserProjects(userId: ID!): [Project!]!
    getNotifications(onlyUnread: Boolean): [Notification!]!
    getUnreadNotificationCount: Int!
  }

  # Mutations
  type Mutation {
    updateUserRole(role: Role!): User!
    createUser(input: UserInput): User!
    createProject(input: ProjectInput!): Project!
    reviewProject(
      projectId: ID!
      reviewerId: ID!
      status: ProjectStatus!
    ): Project!
    stakeCoins(projectId: ID!, amount: Int!): MutationResponse!
    addComment(input: CommentInput!): Comment!
    updateMe(input: UserInput!): User!
    deleteMe: MutationResponse!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): MutationResponse!
    updateComment(id: ID!, content: String!): Comment!
    deleteComment(id: ID!): MutationResponse!
    markNotificationRead(id: ID!): MutationResponse!
    markAllNotificationsRead: MutationResponse!
    addCoinsToStudent(studentId: ID!, amount: Int!): MutationResponse!
  }
`;
