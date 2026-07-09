import * as Query from './queries';
import * as Mutation from './mutations';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getProjectById: Query.getProjectById,
    getProjects: Query.getProjects,
    getProjectComments: Query.getProjectComments,
    getFundedProjects: Query.getFundedProjects,
    getLeaderboardProjects: Query.getLeaderboardProjects,
    getUserTransactions: Query.getUserTransactions,
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
  },
};
