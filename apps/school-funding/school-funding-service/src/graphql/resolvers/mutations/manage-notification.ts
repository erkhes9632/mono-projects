import { eq, and } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { notificationsTable } from '../../../db/schema';
import { MutationResolvers } from '../../../types';

export const markNotificationRead: MutationResolvers['markNotificationRead'] =
  async (_, { id }, { db, userId }) => {
    if (!userId) {
      throw new GraphQLError('You need to SignIn', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    try {
      const [notification] = await db
        .select()
        .from(notificationsTable)
        .where(
          and(eq(notificationsTable.id, id), eq(notificationsTable.userId, userId)),
        );

      if (!notification) {
        return { success: false, message: 'Notification not found' };
      }

      await db
        .update(notificationsTable)
        .set({ isRead: true })
        .where(eq(notificationsTable.id, id));

      return { success: true, message: 'Notification marked as read' };
    } catch (err: unknown) {
      console.error('Error marking notification as read:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error',
      };
    }
  };

export const markAllNotificationsRead: MutationResolvers['markAllNotificationsRead'] =
  async (_, __, { db, userId }) => {
    if (!userId) {
      throw new GraphQLError('You need to SignIn', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    try {
      await db
        .update(notificationsTable)
        .set({ isRead: true })
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false),
          ),
        );

      return { success: true, message: 'All notifications marked as read' };
    } catch (err: unknown) {
      console.error('Error marking all notifications as read:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error',
      };
    }
  };

// Helper function to insert notifications from other resolvers
export async function insertNotification(
  db: any,
  userId: string,
  type: string,
  title: string,
  message: string,
  projectId?: string | null,
): Promise<void> {
  try {
    await db.insert(notificationsTable).values({
      userId,
      type,
      title,
      message,
      projectId: projectId ?? null,
    });
  } catch (err) {
    console.error('Error inserting notification:', err);
  }
}
