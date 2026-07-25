import { eq, ne } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus, Role } from '../../../types';

export const getProjects: QueryResolvers['getProjects'] = async (
  _,
  { status },
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
      throw new GraphQLError('User not found.');
    }

    let queryCondition;

    if (status) {
      queryCondition = eq(projectsTable.status, status);
    } else if (currentUser.role === Role.TEACHER) {
      queryCondition = eq(projectsTable.status, ProjectStatus.PENDING);
    } else {
      queryCondition = ne(projectsTable.status, ProjectStatus.PENDING);
    }

    const projects = await db
      .select()
      .from(projectsTable)
      .where(queryCondition);

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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      err instanceof Error ? `System error: ${err.message}` : 'Error',
    );
  }
};
