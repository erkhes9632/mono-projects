import { eq, ne } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus, Role } from '../../../types';

export const getProjects: QueryResolvers['getProjects'] = async (
  _,
  __,
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!currentUser) {
      throw new GraphQLError('User did not found.');
    }

    let projects;

    if (currentUser.role === Role.TEACHER) {
      projects = await db
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.status, ProjectStatus.PENDING));
    } else {
      projects = await db
        .select()
        .from(projectsTable)
        .where(ne(projectsTable.status, ProjectStatus.PENDING));
    }

    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      images: Array.isArray(project.images) ? project.images : [],
      creatorId: project.creatorId,
      status: project.status as ProjectStatus,
      reviewedById: project.reviewedById ?? null,
      totalCoinsCollected: project.totalCoinsCollected,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      err instanceof Error ? `System error: ${err.message}` : 'Error',
    );
  }
};
