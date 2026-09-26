export const typeDefs = `#graphql

  enum GoalStatus {
    ACTIVE
    COMPLETED
    ABANDONED
  }

  enum ObjectiveStatus {
    PENDING
    IN_PROGRESS
    DONE
  }

  enum TaskStatus {
    SCHEDULED
    SENT
    SUBMITTED
    EVALUATING
    DONE
    FAILED
    MISSED
  }

  enum Verdict {
    DONE
    NOT_DONE
  }


  type User {
    id: ID!
    userName: String
    email: String
    telegramChatId: String
    telegramUsername: String
    timezone: String!
    linkCode: String
    createdAt: String
    updatedAt: String
    goals: [Goal!]!
  }

  type Goal {
    id: ID!
    userId: String!
    title: String!
    description: String
    status: GoalStatus!
    progressPercent: Int!
    createdAt: String
    updatedAt: String
    objectives: [Objective!]!
  }

  type Objective {
    id: ID!
    goalId: String!
    title: String!
    description: String
    orderIndex: Int!
    status: ObjectiveStatus!
    progressPercent: Int!
    createdAt: String
    updatedAt: String
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    objectiveId: String!
    title: String!
    description: String
    acceptanceCriteria: String
    scheduledDate: String!
    scheduledTime: String!
    status: TaskStatus!
    telegramMessageId: String
    createdAt: String
    updatedAt: String
  }

  type TaskWithUser {
    id: ID!
    objectiveId: String!
    title: String!
    description: String
    acceptanceCriteria: String
    scheduledDate: String!
    scheduledTime: String!
    status: TaskStatus!
    telegramMessageId: String
    createdAt: String
    updatedAt: String
    telegramChatId: String
    telegramUsername: String
    timezone: String
  }

  type Submission {
    id: ID!
    taskId: String!
    userId: String!
    content: String!
    telegramMessageId: String
    submittedAt: String
  }

  type Evaluation {
    id: ID!
    submissionId: String!
    verdict: Verdict!
    aiFeedback: String
    aiScore: Int
    evaluatedAt: String
  }

  type MutationResponse {
    success: Boolean!
    message: String!
  }


  input GoalInput {
    title: String!
    description: String
  }

  input ObjectiveInput {
    title: String!
    description: String
    orderIndex: Int
  }

  input TaskInput {
    objectiveId: String!
    title: String!
    description: String
    acceptanceCriteria: String
    scheduledDate: String!
    scheduledTime: String!
  }


  type Query {
    getMyGoals: [Goal!]!

    getGoalTree(goalId: ID!): Goal


    getTasksDueNow(windowMinutes: Int!): [TaskWithUser!]!

    getActiveTaskForChat(chatId: String!): Task

    getUser(id: ID!): User

    getTasks(scheduledDate: String!): [Task!]!
  }


  type Mutation {
    syncUser: User!

    createGoal(input: GoalInput!): Goal!

    bulkCreateObjectives(goalId: ID!, objectives: [ObjectiveInput!]!): [Objective!]!

    bulkCreateTasks(objectiveId: ID!, tasks: [TaskInput!]!): [Task!]!

    linkTelegramAccount(code: String!, chatId: String!, username: String!): User

    recordTaskSent(taskId: ID!, telegramMessageId: String!): Task!

    recordSubmission(taskId: ID!, content: String!, telegramMessageId: String): Submission!

    recordEvaluation(submissionId: ID!, verdict: Verdict!, aiFeedback: String, aiScore: Int): Evaluation!

    markTaskMissed(taskId: ID!): Task!

    linkTelegram(telegramChatId: String!, telegramUsername: String!): User
  }
`;
