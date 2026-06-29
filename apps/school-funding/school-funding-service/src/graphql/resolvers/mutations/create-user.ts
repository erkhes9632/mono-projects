import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/user.schema';
import { CreateUserMutationResolvers } from '../../../types';

export const createUser: CreateUserMutationResolvers['createUser'] = async (
  _,
  { input },
  { db },
) => {
  const { userName, email, avatarUrl, age } = input;

  try {
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUsers.length > 0) {
      throw new GraphQLError('User already exists');
    }

    await db.insert(usersTable).values({
      userName,
      email,
      avatarUrl: avatarUrl ?? null,
      age: age ?? null,
    });

    return { message: 'User successfully created' };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) {
      throw err;
    }
    if (err instanceof Error) {
      throw new GraphQLError(`System Error: ${err.message}`);
    }
    throw new GraphQLError('An unknown error occurred');
  }
};
