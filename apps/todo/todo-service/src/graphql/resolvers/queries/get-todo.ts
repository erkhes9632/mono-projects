import { Context } from '../../../types/index';

type GetTodosArgs = {
  userId: string;
};

export const getTodos = async (
  _: unknown,
  args: GetTodosArgs,
  ctx: Context,
) => {
  const { db } = ctx;
  const { userId } = args;

  return await db.todo.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
