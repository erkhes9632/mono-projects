import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db/schema';
import { MutationResolvers, ProjectStatus } from '../../../types';

export const updateProject: MutationResolvers['updateProject'] = async (
  _,
  { id, input },
  { db, userId },
) => {
  if (!userId)
    throw new GraphQLError('SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id));
  if (!project) throw new GraphQLError('NO project found');
  if (project.creatorId !== userId)
    throw new GraphQLError('You can not access.', {
      extensions: { code: 'FORBIDDEN' },
    });

  const [updated] = await db
    .update(projectsTable)
    .set({
      title: input.title,
      description: input.description,
      images: input.images ?? [],
      status: ProjectStatus.PENDING,
    })
    .where(eq(projectsTable.id, id))
    .returning();

  return {
    ...updated,
    images: Array.isArray(updated.images) ? (updated.images as string[]) : [],
    status: updated.status as ProjectStatus,
    reviewedById: updated.reviewedById ?? null,
  };
};

export const deleteProject: MutationResolvers['deleteProject'] = async (
  _,
  { id },
  { db, userId },
) => {
  if (!userId)
    throw new GraphQLError('SignIn.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id));
  if (!project) throw new GraphQLError('NO project found');
  if (project.creatorId !== userId)
    throw new GraphQLError('You can not access', {
      extensions: { code: 'FORBIDDEN' },
    });

  await db.delete(projectsTable).where(eq(projectsTable.id, id));

  return {
    success: true,
    message: 'Succesfully deleted',
  };
};
