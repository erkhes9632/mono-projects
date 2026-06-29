import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export type UserRole = 'STUDENT' | 'TEACHER';

export const usersTable = sqliteTable('users_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userName: text('user_name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  age: int('age'),
  role: text('role').$type<UserRole>().default('STUDENT').notNull(),
  coinBalance: int('coin_balance').default(0).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
});
