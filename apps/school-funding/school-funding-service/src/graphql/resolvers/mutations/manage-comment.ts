import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { commentsTable } from '../../../db/schema';
import { MutationResolvers, CommentType } from '../../../types';

export const updateComment: MutationResolvers['updateComment'] = async (
  _,
  { id, content },
  { db, userId },
) => {
  if (!userId)
    throw new GraphQLError('SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id));
  if (!comment) throw new GraphQLError('Can not Find');
  if (comment.authorId !== userId)
    throw new GraphQLError('You can not access', {
      extensions: { code: 'FORBIDDEN' },
    });

  const [updated] = await db
    .update(commentsTable)
    .set({ content })
    .where(eq(commentsTable.id, id))
    .returning();

  return updated as CommentType;
};

export const deleteComment: MutationResolvers['deleteComment'] = async (
  _,
  { id },
  { db, userId },
) => {
  if (!userId)
    throw new GraphQLError('SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });

  const [comment] = await db
    .select()
    .from(commentsTable)
    .where(eq(commentsTable.id, id));
  if (!comment) throw new GraphQLError('Can not find');
  if (comment.authorId !== userId)
    throw new GraphQLError('You can not access', {
      extensions: { code: 'FORBIDDEN' },
    });

  await db.delete(commentsTable).where(eq(commentsTable.id, id));

  return {
    success: true,
    message: 'Succesfully deleted',
  };
};
