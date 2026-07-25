import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus } from '../../../types';

export const getMyProjects: QueryResolvers['getMyProjects'] = async (
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
    console.error('Error fetching my projects:', err);
    return [];
  }
};
