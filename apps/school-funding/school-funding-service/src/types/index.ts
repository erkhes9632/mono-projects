import { drizzleProvider } from '../drizzle.provider';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type Maybe<T> = T | null | undefined;

export type DB = ReturnType<typeof drizzleProvider>;

export interface GraphQLContext {
  db: DB;
  env: Env;
  userId?: string;
}

export type BaseResolver<TArgs = any, TResult = any, TParent = unknown> = (
  parent: TParent,
  args: TArgs,
  context: GraphQLContext,
  info: any,
) => Promise<TResult> | TResult;

export type UserType = {
  id: string;
  userName: string;
  email: string;
  role: Role;
  age?: number | null;
  createdAt: string;
};

export type UserInput = {
  userName: string;
  email: string;
};

export type MutationResponse = {
  message: string;
};

export interface CreateUserMutationResolvers {
  createUser: BaseResolver<{ input: UserInput }, MutationResponse>;
}

export interface GetUserQueryResolvers {
  getUsers: BaseResolver<unknown, UserType[]>;
}
