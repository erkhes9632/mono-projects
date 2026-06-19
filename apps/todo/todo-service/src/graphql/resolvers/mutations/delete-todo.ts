import { Context } from '../../../types/index';

export const deleteTodo = async (
  _: unknown,
  args: { id: string },
  context: Context,
) => {
  const { db } = context;
  const { id } = args;

  try {
    if (!id) {
      throw new Error('Todo ID is required.');
    }

    await db.todo.delete({
      where: { id: id },
    });

    return {
      message: 'Todo data deleted successfully.',
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Delete Error: ${err.message}`);
    }
    throw new Error('An unknown error occurred.');
  }
};
