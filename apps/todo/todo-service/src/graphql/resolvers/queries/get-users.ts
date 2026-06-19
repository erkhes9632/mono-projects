import { Context } from '../../../types/index';

export const getUsers = (_: unknown, __: unknown, ctx: Context) => {
  const { db } = ctx;
  return db.user.findMany();
};
