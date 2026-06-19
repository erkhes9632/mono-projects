import { Context } from '../../../types/index';

type TodoInputArgs = {
  userId: string;
  input: {
    title: string;
    description?: string;
    xpReward: number;
  };
};

export const createTodo = async (
  _: unknown,
  args: TodoInputArgs,
  context: Context,
) => {
  const { db } = context;
  const { userId, input } = args;

  try {
    if (!userId) {
      throw new Error('User ID is required.');
    }
    if (!input || !input.title) {
      throw new Error('Title is required.');
    }

    await db.todo.create({
      data: {
        title: input.title,
        description: input.description || null,
        xpReward: input.xpReward,
        isCompleted: false,
        userId: userId,
      },
    });

    return {
      message: 'Todo created successfully',
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`System Error: ${err.message}`);
    }
    throw new Error('An unknown error occurred.');
  }
};
