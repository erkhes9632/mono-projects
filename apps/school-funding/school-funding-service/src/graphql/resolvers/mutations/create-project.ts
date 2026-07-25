import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db/schema';
import { MutationResolvers, ProjectStatus } from '../../../types';

export const createProject: MutationResolvers['createProject'] = async (
  _,
  { input },
  { db, userId },
) => {
  const { title, description, images } = input;

  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const [newProject] = await db
      .insert(projectsTable)
      .values({
        title,
        description,
        images: images ?? [],
        creatorId: userId,
        status: ProjectStatus.PENDING,
        totalCoinsCollected: 0,
      })
      .returning();

    return {
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      images: Array.isArray(newProject.images) ? newProject.images : [],
      creatorId: newProject.creatorId,
      status: newProject.status as ProjectStatus,
      reviewedById: newProject.reviewedById ?? null,
      totalCoinsCollected: newProject.totalCoinsCollected,
      createdAt: String(newProject.createdAt),
      updatedAt: String(newProject.updatedAt),
    };
  } catch (err: unknown) {
    throw new GraphQLError(
      err instanceof Error
        ? `An error occurred while creating the project: ${err.message}`
        : 'System error',
    );
  }
};
