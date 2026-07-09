import { ilike } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db/schema';
import { QueryResolvers } from '../../../types';

export const getUsers: QueryResolvers['getUsers'] = async (
  _,
  { searchName },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn');
  }

  try {
    const query = db.select().from(usersTable);

    if (searchName) {
      query.where(ilike(usersTable.userName, `%${searchName}%`));
    }

    const users = await query;
    return users as any;
  } catch (err) {
    return [];
  }
};
