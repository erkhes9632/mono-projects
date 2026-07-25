import { eq, and, desc, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { notificationsTable } from '../../../db/schema';
import { QueryResolvers } from '../../../types';

export const getNotifications: QueryResolvers['getNotifications'] = async (
  _,
  { onlyUnread },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const conditions = [eq(notificationsTable.userId, userId)];
    if (onlyUnread) {
      conditions.push(eq(notificationsTable.isRead, false));
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(and(...conditions))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);

    return notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      projectId: n.projectId ?? null,
      isRead: n.isRead,
      createdAt: String(n.createdAt),
    }));
  } catch (err: unknown) {
    console.error('Error fetching notifications:', err);
    return [];
  }
};

export const getUnreadNotificationCount: QueryResolvers['getUnreadNotificationCount'] =
  async (_, __, { db, userId }) => {
    if (!userId) return 0;

    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false),
          ),
        );

      return result?.count ?? 0;
    } catch (err: unknown) {
      console.error('Error counting notifications:', err);
      return 0;
    }
  };
