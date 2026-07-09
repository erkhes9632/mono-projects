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
    throw new GraphQLError('Unauthorized');
  }

  if (role !== 'STUDENT' && role !== 'TEACHER') {
    throw new GraphQLError('Invalid role provided');
  }

  try {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        role: role as 'STUDENT' | 'TEACHER',
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
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  } catch (err) {
    console.error('Error in updateUserRole resolver:', err);
    throw new GraphQLError('Failed to update user role');
  }
};
