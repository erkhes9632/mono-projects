import { drizzle } from 'drizzle-orm/d1';
import * as schema from './user.schema';

export * from './user.schema';

export const createDb = (env: Env) => drizzle(env.DB, { schema });
