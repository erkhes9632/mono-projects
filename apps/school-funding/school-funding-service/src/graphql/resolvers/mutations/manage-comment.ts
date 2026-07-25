import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { commentsTable } from '../../../db/schema';
import { MutationResolvers, CommentType } from '../../../types';

export const updateComment: MutationResolvers['updateComment'] = async (
  _,
  { id, content },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id));

  if (!comment) throw new GraphQLError('Comment not found');

  if (comment.authorId !== userId) {
    throw new GraphQLError('You do not have permission', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  const [updated] = await db
    .update(commentsTable)
    .set({ content })
    .where(eq(commentsTable.id, id))
    .returning();

  return {
    ...updated,
    createdAt: String(updated.createdAt),
    updatedAt: String(updated.updatedAt),
  } as unknown as CommentType;
};

export const deleteComment: MutationResolvers['deleteComment'] = async (
  _,
  { id },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id));

  if (!comment) throw new GraphQLError('Comment not found');

  if (comment.authorId !== userId) {
    throw new GraphQLError('You do not have permission', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, id));

  return {
    success: true,
    message: 'Successfully deleted',
  };
};
