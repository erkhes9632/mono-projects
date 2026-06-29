import { usersTable } from '../../../db/user.schema';
import { GetUserQueryResolvers } from '../../../types';

export const getUsers: GetUserQueryResolvers['getUsers'] = async (
  _,
  __,
  { db },
) => {
  const users = await db.select().from(usersTable);

  return users.map((user) => ({
    id: user.id,
    userName: user.userName,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    age: user.age ?? null,
    role: user.role,
    coinBalance: user.coinBalance,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
};
