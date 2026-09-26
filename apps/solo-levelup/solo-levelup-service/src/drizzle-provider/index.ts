import { drizzle } from 'drizzle-orm/d1';
import { D1Database } from '@cloudflare/workers-types';
import * as schema from '../db';

export const createDbProvider = (DB: D1Database) => {
  if (!DB) {
    throw new Error('D1 Database instance is missing!');
  }
  return drizzle(DB, { schema });
};
