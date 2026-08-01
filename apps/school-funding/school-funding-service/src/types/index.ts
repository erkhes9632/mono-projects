import { drizzleProvider } from '../drizzle.provider';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../db/schema';

export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export enum ProjectStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDED = 'FUNDED',
}

export enum TransactionType {
  EARN = 'EARN',
  STAKE = 'STAKE',
  REFUND = 'REFUND',
}

export type DB = ReturnType<typeof drizzleProvider>;

export type GraphQLContext = {
  db: DrizzleD1Database<typeof schema>;
  env: Env;
  userId?: string | null;
};

export type BaseResolver<TArgs = any, TResult = any, TParent = unknown> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: any,
) => Promise<TResult> | TResult;

// Data Types
export type UserType = {
  id: string;
  userName: string;
  email: string;
  avatarUrl?: string | null;
  role: Role;
  coinBalance: number;
  createdAt: string;
  updatedAt: string;
  projects?: ProjectType[];
};

export type ProjectType = {
  id: string;
  title: string;
  description: string;
  images: string[];
  creatorId: string;
  status: ProjectStatus;
  reviewedById?: string | null;
  totalCoinsCollected: number;
  createdAt: string;
  updatedAt: string;
};

export type FundingType = {
  id: string;
  projectId: string;
  studentId: string;
  coinAmount: number;
  createdAt: string;
};

export type CommentType = {
  id: string;
  projectId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type CoinTransactionType = {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId?: string | null;
  createdAt: string;
};

// Notification Types
export type NotificationType = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  projectId?: string | null;
  isRead: boolean;
  createdAt: string;
};

// Input Types
export type UserInput = {
  userName: string;
  // email is required by createUser but not by updateMe (Edit Profile)
  email?: string;
  avatarUrl?: string;
  role?: Role;
};

export type ProjectInput = {
  title: string;
  description: string;
  images?: string[];
  creatorId: string;
};

export type CommentInput = {
  projectId: string;
  authorId: string;
  content: string;
};

export type MutationResponse = {
  success: boolean;
  message: string;
};

// Resolvers Interfaces
export interface QueryResolvers {
  getUsers: BaseResolver<{ searchName?: string }, UserType[]>;
  getUserById: BaseResolver<{ id?: string }, UserType | null>;
  getProjects: BaseResolver<{ status?: ProjectStatus }, ProjectType[]>;
  getMyProjects: BaseResolver<unknown, ProjectType[]>;
  getProjectById: BaseResolver<{ id: string }, ProjectType | null>;
  getProjectComments: BaseResolver<{ projectId: string }, CommentType[]>;
  getUserTransactions: BaseResolver<{ userId: string }, CoinTransactionType[]>;
  getLeaderboardProjects: BaseResolver<{ limit?: number }, ProjectType[]>;
  getFundedProjects: BaseResolver<{ limit?: number }, ProjectType[]>;
  getUserProjects: BaseResolver<{ userId: string }, ProjectType[]>;
  getNotifications: BaseResolver<{ onlyUnread?: boolean }, NotificationType[]>;
  getUnreadNotificationCount: BaseResolver<unknown, number>;
}

export interface MutationResolvers {
  updateUserRole: BaseResolver<{ role: 'STUDENT' | 'TEACHER' }, UserType>;
  createUser: BaseResolver<{ input: UserInput }, UserType>;
  createProject: BaseResolver<{ input: ProjectInput }, ProjectType>;
  reviewProject: BaseResolver<
    { projectId: string; reviewerId: string; status: ProjectStatus },
    ProjectType
  >;
  stakeCoins: BaseResolver<
    { projectId: string; amount: number },
    MutationResponse
  >;
  addComment: BaseResolver<{ input: CommentInput }, CommentType>;
  updateMe: BaseResolver<
    { input: { userName: string; avatarUrl?: string } },
    UserType
  >;
  deleteMe: BaseResolver<unknown, MutationResponse>;

  updateProject: BaseResolver<{ id: string; input: ProjectInput }, ProjectType>;
  deleteProject: BaseResolver<{ id: string }, MutationResponse>;

  updateComment: BaseResolver<{ id: string; content: string }, CommentType>;
  deleteComment: BaseResolver<{ id: string }, MutationResponse>;
  markNotificationRead: BaseResolver<{ id: string }, MutationResponse>;
  markAllNotificationsRead: BaseResolver<unknown, MutationResponse>;
  addCoinsToStudent: BaseResolver<
    { studentId: string; amount: number },
    MutationResponse
  >;
}
