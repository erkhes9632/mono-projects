import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db';

export const drizzleProvider = (DB: D1Database) => {
  if (!DB) {
    throw new Error('D1 Database instance is missing!');
  }
  return drizzle(DB, { schema });
};
