import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db/schema';
import { MutationResolvers, ProjectStatus, Role } from '../../../types';

export const reviewProject: MutationResolvers['reviewProject'] = async (
  _,
  { projectId, status },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!currentUser || currentUser.role !== Role.TEACHER) {
      throw new GraphQLError('You can not access', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      throw new GraphQLError('No project found');
    }

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        status: status,
        reviewedById: userId,
      })
      .where(eq(projectsTable.id, projectId))
      .returning();

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      images: Array.isArray(updatedProject.images) ? updatedProject.images : [],
      creatorId: updatedProject.creatorId,
      status: updatedProject.status as ProjectStatus,
      reviewedById: updatedProject.reviewedById,
      totalCoinsCollected: updatedProject.totalCoinsCollected,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(err instanceof Error ? err.message : 'System error');
  }
};
