import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

// Types
export type UserRole = 'STUDENT' | 'TEACHER';
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDED';
export type TransactionType = 'EARN' | 'STAKE' | 'REFUND';

// Users Table
export const usersTable = sqliteTable('users_table', {
  id: text('id').primaryKey(),
  userName: text('user_name').notNull(),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  role: text('role').$type<UserRole>().default('STUDENT').notNull(),
  coinBalance: int('coin_balance').default(0).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
});

// Projects Table
export const projectsTable = sqliteTable('projects_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description').notNull(),
  images: text('images', { mode: 'json' })
    .$type<string[]>()
    .default([])
    .notNull(),
  creatorId: text('creator_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  status: text('status').$type<ProjectStatus>().default('PENDING').notNull(),
  reviewedById: text('reviewed_by_id').references(() => usersTable.id),
  totalCoinsCollected: int('total_coins_collected').default(0).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
});

// Project Funding/Staking Table
export const fundingsTable = sqliteTable('fundings_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: text('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  coinAmount: int('coin_amount').notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

// Comments Table
export const commentsTable = sqliteTable('comments_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  projectId: text('project_id')
    .notNull()
    .references(() => projectsTable.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
  updatedAt: text('updated_at')
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
});

// Notifications Table
export type NotificationType = 'PROJECT_REVIEWED' | 'NEW_COMMENT' | 'PROJECT_FUNDED';

export const notificationsTable = sqliteTable('notifications_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  type: text('type').$type<NotificationType>().notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  projectId: text('project_id').references(() => projectsTable.id, {
    onDelete: 'set null',
  }),
  isRead: int('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});

// Coin Transactions Audit Log Table
export const coinTransactionsTable = sqliteTable('coin_transactions_table', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  amount: int('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  referenceId: text('reference_id'),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString())
    .notNull(),
});
