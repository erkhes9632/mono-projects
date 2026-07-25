import { desc, and, or, eq, gte, sql } from 'drizzle-orm';
import { projectsTable, fundingsTable } from '../../../db/schema';
import { QueryResolvers, ProjectStatus } from '../../../types';

export const getLeaderboardProjects: QueryResolvers['getLeaderboardProjects'] =
  async (_, { limit = 10 }, { db }) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

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
          recentCoins:
            sql<number>`COALESCE(SUM(${fundingsTable.coinAmount}), 0)`.as(
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
            gte(fundingsTable.createdAt, thirtyDaysAgoIso),
          ),
        )
        .groupBy(
          projectsTable.id,
          projectsTable.title,
          projectsTable.description,
          projectsTable.images,
          projectsTable.creatorId,
          projectsTable.status,
          projectsTable.reviewedById,
          projectsTable.totalCoinsCollected,
          projectsTable.createdAt,
          projectsTable.updatedAt,
        )
        .orderBy(desc(sql`recent_coins`))
        .limit(limit);

      return trendingProjects.map((p) => {
        // Images JSON Parsing Хамгаалалт
        let parsedImages: string[] = [];
        if (Array.isArray(p.images)) {
          parsedImages = p.images as string[];
        } else if (typeof p.images === 'string') {
          try {
            parsedImages = JSON.parse(p.images);
          } catch {
            parsedImages = [];
          }
        }

        return {
          id: p.id,
          title: p.title,
          description: p.description,
          images: parsedImages,
          creatorId: p.creatorId,
          status: p.status as ProjectStatus,
          reviewedById: p.reviewedById ?? null,
          totalCoinsCollected: p.totalCoinsCollected ?? 0,
          createdAt: String(p.createdAt),
          updatedAt: String(p.updatedAt),
        };
      });
    } catch (err: unknown) {
      console.error('Error in getLeaderboardProjects:', err);
      return [];
    }
  };
