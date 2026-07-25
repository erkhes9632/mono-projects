import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { MutationResolvers, Role } from '../../../types';

export const updateUserRole: MutationResolvers['updateUserRole'] = async (
  _,
  { role },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (role !== Role.STUDENT && role !== Role.TEACHER) {
    throw new GraphQLError('Invalid role provided', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  try {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        role: role as Role,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updatedUser) {
      throw new GraphQLError('User not found in database');
    }

    return {
      id: updatedUser.id,
      userName: updatedUser.userName,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role as Role,
      coinBalance: updatedUser.coinBalance,
      createdAt: String(updatedUser.createdAt),
      updatedAt: String(updatedUser.updatedAt),
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    console.error('Error in updateUserRole resolver:', err);
    throw new GraphQLError('Failed to update user role');
  }
};
