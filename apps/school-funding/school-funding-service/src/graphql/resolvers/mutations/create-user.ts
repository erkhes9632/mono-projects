import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { MutationResolvers, Role } from '../../../types';

export const createUser: MutationResolvers['createUser'] = async (
  _,
  { input },
  { db, userId },
) => {
  const { userName, email, avatarUrl, role } = input;

  if (!userId) {
    throw new GraphQLError('You need to SignIn');
  }

  return await db
    .transaction(async (tx) => {
      const existingUsers = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));

      if (existingUsers.length > 0) {
        throw new GraphQLError('User already exists');
      }

      const [newUser] = await tx
        .insert(usersTable)
        .values({
          id: userId,
          userName,
          email,
          avatarUrl: avatarUrl ?? null,
          role: role ?? Role.STUDENT,
          coinBalance: 100,
        })
        .returning();

      return newUser as any;
    })
    .catch((err) => {
      if (err instanceof GraphQLError) throw err;
      throw new GraphQLError(
        err instanceof Error ? err.message : 'System error',
      );
    });
};
