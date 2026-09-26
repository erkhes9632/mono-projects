import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db';
import { D1Database } from '@cloudflare/workers-types';
import { createDbProvider } from '../drizzle-provider';

export interface Env {
  DB: D1Database;
  N8N_SERVICE_KEY: string;
  N8N_GOAL_DECOMPOSE_WEBHOOK_URL?: string;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SIGNING_SECRET: string;
}

export interface GraphQLContext {
  db: ReturnType<typeof drizzle<typeof schema>>;
  isService: boolean;
  userId?: string;
  userEmail?: string;
  env: Env;
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum ObjectiveStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskStatus {
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  SUBMITTED = 'SUBMITTED',
  EVALUATING = 'EVALUATING',
  DONE = 'DONE',
  FAILED = 'FAILED',
  MISSED = 'MISSED',
}

export type Verdict = 'DONE' | 'NOT_DONE';

export type DB = ReturnType<typeof createDbProvider>;

export type BaseResolver<TArgs = unknown, TResult = unknown, TParent = unknown> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: unknown,
) => Promise<TResult> | TResult;

export type UserType = {
  id: string;
  userName?: string | null;
  email?: string | null;
  telegramChatId?: string | null;
  telegramUsername?: string | null;
  timezone: string;
  linkCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalType = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  status: GoalStatus;
  progressPercent: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ObjectiveType = {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  status: ObjectiveStatus;
  progressPercent: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskType = {
  id: string;
  objectiveId: string;
  title: string;
  description?: string | null;
  acceptanceCriteria?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: TaskStatus;
  telegramMessageId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskWithUserType = TaskType & {
  telegramChatId?: string | null;
  telegramUsername?: string | null;
  timezone?: string | null;
};

export type SubmissionType = {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  telegramMessageId?: string | null;
  submittedAt: Date;
};

export type EvaluationType = {
  id: string;
  submissionId: string;
  verdict: Verdict;
  aiFeedback?: string | null;
  aiScore?: number | null;
  evaluatedAt: Date;
};

export type ObjectiveInput = {
  id?: string;
  title: string;
  description?: string;
  orderIndex?: number;
};

export type TaskInput = {
  id?: string;
  objectiveId: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  scheduledDate: string;
  scheduledTime?: string;
};

export type GoalInput = {
  title: string;
  description?: string;
};

export type MutationResponse = {
  success: boolean;
  message: string;
};

export interface QueryResolvers {
  getMyGoals: BaseResolver<{}, GoalType[]>;
  getGoalTree: BaseResolver<{ goalId: string }, any>;
  getTasksDueNow: BaseResolver<{ windowMinutes: number }, TaskWithUserType[]>;
  getActiveTaskForChat: BaseResolver<{ chatId: string }, TaskType | null>;
  getUser: BaseResolver<{ id: string }, UserType | null>;
  getTasks: BaseResolver<{ scheduledDate: string }, TaskType[]>;
}

export interface MutationResolvers {
  syncUser: BaseResolver<{}, UserType>;
  createGoal: BaseResolver<GoalInput, GoalType>;
  bulkCreateObjectives: BaseResolver<
    { goalId: string; objectives: ObjectiveInput[] },
    ObjectiveType[]
  >;
  bulkCreateTasks: BaseResolver<
    { objectiveId: string; tasks: TaskInput[] },
    TaskType[]
  >;
  linkTelegramAccount: BaseResolver<
    { code: string; chatId: string; username: string },
    UserType
  >;
  recordTaskSent: BaseResolver<
    { taskId: string; telegramMessageId: string },
    TaskType
  >;
  recordSubmission: BaseResolver<
    { taskId: string; content: string; telegramMessageId?: string },
    SubmissionType
  >;
  recordEvaluation: BaseResolver<
    {
      submissionId: string;
      verdict: 'DONE' | 'NOT_DONE';
      aiFeedback?: string;
      aiScore?: number;
    },
    EvaluationType
  >;
  markTaskMissed: BaseResolver<{ taskId: string }, TaskType>;
  linkTelegram: BaseResolver<
    { telegramChatId: string; telegramUsername: string },
    UserType
  >;
}
