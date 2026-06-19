import { Context } from '../../../types/index';

export const deleteUser = async (
  _: unknown,
  args: { id: string },
  context: Context,
) => {
  const { db } = context;
  const { id } = args;

  try {
    if (!id) {
      throw new Error('User ID is required.');
    }

    await db.todo.deleteMany({
      where: { userId: id },
    });

    await db.user.delete({
      where: { id: id },
    });

    return {
      message: 'User and all associated data deleted successfully.',
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Delete Error: ${err.message}`);
    }
    throw new Error('An unknown error occurred.');
  }
};
