import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { QueryResolvers, Role } from '../../../types';

export const getUserById: QueryResolvers['getUserById'] = async (
  _,
  { id },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    const queryUserId = id || userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, queryUserId));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      role: user.role as Role,
      coinBalance: user.coinBalance,
      createdAt: String(user.createdAt),
      updatedAt: String(user.updatedAt),
    };
  } catch (err: unknown) {
    console.error('Error fetching user by ID:', err);
    return null;
  }
};
