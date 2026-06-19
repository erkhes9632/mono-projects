import { Context } from '../../../types/index';

type User = {
  name: string;
  email: string;
  password: string;
};

export const createUser = async (
  _: unknown,
  args: { input: User },
  context: Context,
) => {
  const { db } = context;
  const { input } = args;

  try {
    if (!input || !input.name || !input.email || !input.password) {
      throw new Error('Something is missing');
    }

    await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
    });

    return {
      message: 'Success',
      success: true,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`System Err ${err.message}`);
    }
    throw new Error('Unknown error');
  }
};
