import { gql } from '@apollo/client';

export const SYNC_USER = gql`
  mutation SyncUser {
    syncUser {
      id
      userName
      email
      telegramChatId
      telegramUsername
      timezone
      linkCode
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      userName
      email
      telegramChatId
      telegramUsername
      timezone
      linkCode
      goals {
        id
        title
        status
        progressPercent
      }
    }
  }
`;

export const GET_MY_GOALS = gql`
  query GetMyGoals {
    getMyGoals {
      id
      title
      description
      status
      progressPercent
      objectives {
        id
        title
        status
        progressPercent
      }
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($scheduledDate: String!) {
    getTasks(scheduledDate: $scheduledDate) {
      id
      objectiveId
      title
      description
      acceptanceCriteria
      scheduledDate
      scheduledTime
      status
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: GoalInput!) {
    createGoal(input: $input) {
      id
      userId
      title
      description
      status
      progressPercent
      createdAt
    }
  }
`;

export const LINK_TELEGRAM = gql`
  mutation LinkTelegram($telegramChatId: String!, $telegramUsername: String!) {
    linkTelegram(telegramChatId: $telegramChatId, telegramUsername: $telegramUsername) {
      id
      userName
      email
      telegramChatId
      telegramUsername
      timezone
      linkCode
      createdAt
      updatedAt
    }
  }
`;

export const GET_GOAL_TREE = gql`
  query GetGoalTree($goalId: ID!) {
    getGoalTree(goalId: $goalId) {
      id
      userId
      title
      description
      status
      progressPercent
      createdAt
      updatedAt
      objectives {
        id
        title
        description
        orderIndex
        status
        progressPercent
        tasks {
          id
          title
          description
          acceptanceCriteria
          scheduledDate
          scheduledTime
          status
          telegramMessageId
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GET_MY_GOALS_FULL = gql`
  query GetMyGoals {
    getMyGoals {
      id
      title
      description
      status
      progressPercent
      createdAt
      updatedAt
      objectives {
        id
        title
        status
        progressPercent
        tasks {
          id
          status
        }
      }
    }
  }
`;
