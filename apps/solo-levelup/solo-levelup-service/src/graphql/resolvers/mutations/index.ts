import { syncUser } from './sync-user';
import { createGoal } from './create-goal';
import { bulkCreateObjectives } from './bulk-create-objectives';
import { bulkCreateTasks } from './bulk-create-tasks';
import { recordSubmission } from './record-submission';
import { recordEvaluation } from './record-evaluation';
import { linkTelegramAccount } from './link-telegram-account';
import { recordTaskSent } from './record-task-sent';
import { markTaskMissed } from './mark-task-missed';
import { linkTelegram } from './link-telegram';

export const mutations = {
  syncUser,
  createGoal,
  bulkCreateObjectives,
  bulkCreateTasks,
  recordSubmission,
  recordEvaluation,
  linkTelegramAccount,
  recordTaskSent,
  markTaskMissed,
  linkTelegram,
};
