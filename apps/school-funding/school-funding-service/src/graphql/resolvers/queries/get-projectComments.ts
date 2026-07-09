import { eq, asc } from 'drizzle-orm';
import { commentsTable } from '../../../db/schema';
import { QueryResolvers } from '../../../types';

export const getProjectComments: QueryResolvers['getProjectComments'] = async (
  _,
  { projectId },
  { db, userId },
) => {
  if (!userId) {
    return [];
  }

  try {
    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.projectId, projectId))
      .orderBy(asc(commentsTable.createdAt));

    return comments.map((comment) => ({
      id: comment.id,
      projectId: comment.projectId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  } catch (err: unknown) {
    return [];
  }
};
