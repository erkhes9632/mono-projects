import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus, Role } from '../../../types';

export const getUserProjects: QueryResolvers['getUserProjects'] = async (
  _,
  { userId },
  { db, userId: currentUserId },
) => {
  if (!currentUserId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  // Only TEACHER role can view other users' projects
  const [currentUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, currentUserId));

  if (!currentUser || currentUser.role !== Role.TEACHER) {
    throw new GraphQLError('You do not have permission', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.creatorId, userId))
      .orderBy(projectsTable.createdAt);

    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      images: Array.isArray(project.images) ? project.images : [],
      creatorId: project.creatorId,
      status: project.status as ProjectStatus,
      reviewedById: project.reviewedById ?? null,
      totalCoinsCollected: project.totalCoinsCollected,
      createdAt: String(project.createdAt),
      updatedAt: String(project.updatedAt),
    }));
  } catch (err: unknown) {
    console.error('Error fetching user projects:', err);
    return [];
  }
};
