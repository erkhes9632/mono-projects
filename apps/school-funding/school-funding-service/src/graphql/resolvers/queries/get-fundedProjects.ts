import { desc, eq } from 'drizzle-orm';
import { projectsTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus } from '../../../types';

export const getFundedProjects: QueryResolvers['getFundedProjects'] = async (
  _,
  __,
  { db },
) => {
  try {
    const fundedProjects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, ProjectStatus.FUNDED))
      .orderBy(desc(projectsTable.updatedAt));

    return fundedProjects.map((project) => ({
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
    return [];
  }
};
