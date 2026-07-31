import { Context } from '../../../types/index';

export const getUsers = (_: unknown, __: unknown, ctx: Context) => {
  const { db } = ctx;
  return db.user.findMany();
};

export const getUserById = async (
  _: unknown,
  args: { id: string },
  ctx: Context,
) => {
  const { db } = ctx;
  const { id } = args;

  if (!id) return null;

  return db.user.findUnique({
    where: { id },
  });
};
