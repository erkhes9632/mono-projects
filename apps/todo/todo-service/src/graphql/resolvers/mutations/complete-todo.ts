import { Context } from '../../../types/index';

export const completeTodo = async (
  _: unknown,
  args: { todoId: string },
  context: Context,
) => {
  const { db } = context;
  const userSession = (context as any).currentUser || (context as any).user;
  const { todoId } = args;

  try {
    if (!todoId) {
      throw new Error('Todo ID is required.');
    }

    const existingTodo = await db.todo.findUnique({
      where: { id: todoId },
    });

    if (!existingTodo) {
      throw new Error('Todo not found.');
    }

    const finalUserId = userSession?.id || (existingTodo as any).userId;

    if (!finalUserId) {
      throw new Error('Unauthorized. Owner user ID not found for this task.');
    }

    const user = await db.user.findUnique({
      where: { id: finalUserId },
    });

    if (!user) {
      throw new Error('User not found in database.');
    }

    const nextState = !existingTodo.isCompleted;

    const updatedTodo = await db.todo.update({
      where: { id: todoId },
      data: { isCompleted: nextState },
    });

    let currentXp = user.xp ?? 0;
    let currentLevel = user.level ?? 1;
    const xpReward = (existingTodo as any).xpReward ?? 10;

    if (nextState === true) {
      currentXp += xpReward;
    } else {
      currentXp -= xpReward;
      if (currentXp < 0) currentXp = 0;
    }

    while (currentXp >= currentLevel * 100) {
      currentXp -= currentLevel * 100;
      currentLevel += 1;
    }

    while (currentLevel > 1 && currentXp < 0) {
      currentLevel -= 1;
      currentXp += currentLevel * 100;
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        xp: currentXp,
        level: currentLevel,
      },
    });

    return {
      message: nextState
        ? `Objective completed. +${xpReward} XP allocated.`
        : `Objective reverted. -${xpReward} XP deducted.`,
      success: true,
      todo: updatedTodo,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`System Error: ${err.message}`);
    }
    throw new Error('An unknown error occurred.');
  }
};
