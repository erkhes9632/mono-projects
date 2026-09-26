import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  userName: text('user_name'),
  email: text('email'),
  telegramChatId: text('telegram_chat_id').unique(),
  telegramUsername: text('telegram_username'),
  timezone: text('timezone').default('Asia/Ulaanbaatar').notNull(),
  linkCode: text('link_code'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});

export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['ACTIVE', 'COMPLETED', 'ABANDONED'] })
    .default('ACTIVE')
    .notNull(),
  progressPercent: integer('progress_percent').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});

export const objectives = sqliteTable('objectives', {
  id: text('id').primaryKey(),
  goalId: text('goal_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  orderIndex: integer('order_index').default(0).notNull(),
  status: text('status', { enum: ['PENDING', 'IN_PROGRESS', 'DONE'] })
    .default('PENDING')
    .notNull(),
  progressPercent: integer('progress_percent').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  objectiveId: text('objective_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  acceptanceCriteria: text('acceptance_criteria'),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  status: text('status', {
    enum: [
      'SCHEDULED',
      'SENT',
      'SUBMITTED',
      'EVALUATING',
      'DONE',
      'FAILED',
      'MISSED',
    ],
  })
    .default('SCHEDULED')
    .notNull(),
  telegramMessageId: text('telegram_message_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  telegramMessageId: text('telegram_message_id'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});

export const evaluations = sqliteTable('evaluations', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull(),
  verdict: text('verdict', { enum: ['DONE', 'NOT_DONE'] }).notNull(),
  aiFeedback: text('ai_feedback'),
  aiScore: integer('ai_score').default(0),
  evaluatedAt: integer('evaluated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date(),
  ),
});
