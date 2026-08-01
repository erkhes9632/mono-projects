import { like } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { QueryResolvers, Role } from '../../../types';

export const getUsers: QueryResolvers['getUsers'] = async (
  _,
  { searchName },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  try {
    // SQLite/D1 дээр ilike байдаггүй тул like ашиглав
    const query = searchName
      ? db
          .select()
          .from(usersTable)
          .where(like(usersTable.userName, `%${searchName}%`))
      : db.select().from(usersTable);

    const users = await query;

    return users.map((u) => ({
      id: u.id,
      userName: u.userName,
      email: u.email,
      avatarUrl: u.avatarUrl ?? null,
      role: u.role as Role,
      coinBalance: u.coinBalance,
      createdAt: String(u.createdAt),
      updatedAt: String(u.updatedAt),
    }));
  } catch (err: unknown) {
    console.error('Error fetching users:', err);
    return [];
  }
};
