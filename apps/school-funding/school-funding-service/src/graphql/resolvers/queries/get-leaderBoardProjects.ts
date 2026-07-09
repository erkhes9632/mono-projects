import { desc, and, or, eq, gte, sql } from 'drizzle-orm';
import { projectsTable, fundingsTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus } from '../../../types';

export const getLeaderboardProjects: QueryResolvers['getLeaderboardProjects'] =
  async (_, { limit = 10 }, { db }) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendingProjects = await db
        .select({
          id: projectsTable.id,
          title: projectsTable.title,
          description: projectsTable.description,
          images: projectsTable.images,
          creatorId: projectsTable.creatorId,
          status: projectsTable.status,
          reviewedById: projectsTable.reviewedById,
          totalCoinsCollected: projectsTable.totalCoinsCollected,
          createdAt: projectsTable.createdAt,
          updatedAt: projectsTable.updatedAt,
          recentCoins: sql<number>`sum(${fundingsTable.coinAmount})`.as(
            'recent_coins',
          ),
        })
        .from(fundingsTable)
        .innerJoin(projectsTable, eq(fundingsTable.projectId, projectsTable.id))
        .where(
          and(
            or(
              eq(projectsTable.status, ProjectStatus.APPROVED),
              eq(projectsTable.status, ProjectStatus.FUNDED),
            ),
            gte(fundingsTable.createdAt, sql`${thirtyDaysAgo.toISOString()}`),
          ),
        )
        .groupBy(projectsTable.id)
        .orderBy(desc(sql`recent_coins`))
        .limit(limit);

      return trendingProjects.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? (p.images as string[]) : [],
        status: p.status as ProjectStatus,
        reviewedById: p.reviewedById ?? null,
      }));
    } catch (err: unknown) {
      return [];
    }
  };
