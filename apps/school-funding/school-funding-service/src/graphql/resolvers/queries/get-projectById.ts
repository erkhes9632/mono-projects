import { eq } from 'drizzle-orm';
import { projectsTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus } from '../../../types';

export const getProjectById: QueryResolvers['getProjectById'] = async (
  _,
  { id },
  { db },
) => {
  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      images: project.images,
      creatorId: project.creatorId,
      status: project.status as ProjectStatus,
      reviewedById: project.reviewedById,
      totalCoinsCollected: project.totalCoinsCollected,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  } catch (err: unknown) {
    return null;
  }
};
