import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { MutationResolvers, UserType } from '../../../types';

export const updateMe: MutationResolvers['updateMe'] = async (
  _,
  { input },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      userName: input.userName,
      avatarUrl: input.avatarUrl ?? null,
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updatedUser) {
    throw new GraphQLError('User not found in database', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  return updatedUser as unknown as UserType;
};

export const deleteMe: MutationResolvers['deleteMe'] = async (
  _,
  __,
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  await db.delete(usersTable).where(eq(usersTable.id, userId));

  return {
    success: true,
    message: 'Successfully deleted',
  };
};
