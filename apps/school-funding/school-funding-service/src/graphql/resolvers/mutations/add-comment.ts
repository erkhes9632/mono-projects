import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { commentsTable, projectsTable } from '../../../db/schema';
import { MutationResolvers } from '../../../types';
import { insertNotification } from './manage-notification';

export const addComment: MutationResolvers['addComment'] = async (
  _,
  { input },
  { db, userId },
) => {
  const { projectId, content } = input;

  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      throw new GraphQLError('No project found');
    }

    const [newComment] = await db
      .insert(commentsTable)
      .values({
        projectId,
        authorId: userId,
        content,
      })
      .returning();

    // Insert notification for the project creator (if commenter is not the creator)
    if (project.creatorId !== userId) {
      const truncatedContent =
        content.length > 80 ? content.slice(0, 80) + '...' : content;
      await insertNotification(
        db,
        project.creatorId,
        'NEW_COMMENT',
        `New Comment on "${project.title}"`,
        `Someone commented: "${truncatedContent}"`,
        projectId,
      );
    }

    return {
      id: newComment.id,
      projectId: newComment.projectId,
      authorId: newComment.authorId,
      content: newComment.content,
      createdAt: String(newComment.createdAt),
      updatedAt: String(newComment.updatedAt),
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(err instanceof Error ? err.message : 'Error');
  }
};
