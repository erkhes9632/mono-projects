import * as Query from './queries';
import * as Mutation from './mutations';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getUserById: Query.getUserById,
    getProjectById: Query.getProjectById,
    getProjects: Query.getProjects,
    getMyProjects: Query.getMyProjects,
    getProjectComments: Query.getProjectComments,
    getFundedProjects: Query.getFundedProjects,
    getLeaderboardProjects: Query.getLeaderboardProjects,
    getUserTransactions: Query.getUserTransactions,
    getUserProjects: Query.getUserProjects,
    getNotifications: Query.getNotifications,
    getUnreadNotificationCount: Query.getUnreadNotificationCount,
  },
  Mutation: {
    createUser: Mutation.createUser,
    createProject: Mutation.createProject,
    reviewProject: Mutation.reviewProject,
    addComment: Mutation.addComment,
    updateComment: Mutation.updateComment,
    deleteComment: Mutation.deleteComment,
    updateProject: Mutation.updateProject,
    deleteProject: Mutation.deleteProject,
    updateMe: Mutation.updateMe,
    deleteMe: Mutation.deleteMe,
    stakeCoins: Mutation.stakeCoins,
    updateUserRole: Mutation.updateUserRole,
    markNotificationRead: Mutation.markNotificationRead,
    markAllNotificationsRead: Mutation.markAllNotificationsRead,
    addCoinsToStudent: Mutation.addCoinsToStudent,
  },
};
