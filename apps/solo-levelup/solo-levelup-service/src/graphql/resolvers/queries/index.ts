import { getTasks } from './get-tasks';
import { getUser } from './get-user';
import { getMyGoals } from './get-my-goals';
import { getGoalTree } from './get-goal-tree';
import { getTasksDueNow } from './get-tasks-due-now';
import { getActiveTaskForChat } from './get-active-task-for-chat';

export const queries = {
  getTasks,
  getUser,
  getMyGoals,
  getGoalTree,
  getTasksDueNow,
  getActiveTaskForChat,
};
