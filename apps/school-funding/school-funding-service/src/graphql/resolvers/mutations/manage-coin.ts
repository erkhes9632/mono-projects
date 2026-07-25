import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import {
  fundingsTable,
  projectsTable,
  usersTable,
  coinTransactionsTable,
} from '../../../db/schema';
import {
  MutationResolvers,
  TransactionType,
  ProjectStatus,
  Role,
} from '../../../types';
import { insertNotification } from './manage-notification';

export const stakeCoins: MutationResolvers['stakeCoins'] = async (
  _,
  { projectId, amount },
  { db, userId, env },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero' };
  }

  try {
    // 1. Check project exists and is approved
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      return { success: false, message: 'Project not found' };
    }

    if (project.status !== ProjectStatus.APPROVED) {
      return { success: false, message: 'Project is not eligible for staking' };
    }

    // 2. Check user has enough coins
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user || user.coinBalance < amount) {
      return { success: false, message: 'Not enough coins in your wallet' };
    }

    // 3. Atomic coin deduction using raw D1 API (avoids Drizzle SQL template issues with D1)
    const deductedAmount = amount;

    const updateResult = await env.DB.prepare(
      'UPDATE users_table SET coin_balance = coin_balance - ?1 WHERE id = ?2 AND coin_balance >= ?3',
    )
      .bind(deductedAmount, userId, deductedAmount)
      .run();

    if (!updateResult.success || updateResult.meta.changes === 0) {
      return { success: false, message: 'Not enough coins in your wallet' };
    }

    // 4. Add coins to project (atomic SQL update)
    await env.DB.prepare(
      'UPDATE projects_table SET total_coins_collected = total_coins_collected + ?1 WHERE id = ?2',
    )
      .bind(deductedAmount, projectId)
      .run();

    // 5. Record funding
    await db.insert(fundingsTable).values({
      projectId,
      studentId: userId,
      coinAmount: deductedAmount,
    });

    // 6. Record transaction audit
    await db.insert(coinTransactionsTable).values({
      userId,
      amount: deductedAmount,
      type: TransactionType.STAKE,
      referenceId: projectId,
    });

    return {
      success: true,
      message: 'Successfully donated, Thank you!',
    };
  } catch (err: unknown) {
    console.error('Stake coins error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Transaction failed',
    };
  }
};

export const addCoinsToStudent: MutationResolvers['addCoinsToStudent'] = async (
  _,
  { studentId, amount },
  { db, userId, env },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (amount <= 0) {
    return { success: false, message: 'Amount must be greater than zero' };
  }

  try {
    // 1. Verify the requester is a teacher
    const [currentUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!currentUser || currentUser.role !== Role.TEACHER) {
      return {
        success: false,
        message: 'Only teachers can add coins to students',
      };
    }

    // 2. Verify the target student exists
    const [student] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, studentId));

    if (!student) {
      return { success: false, message: 'Student not found' };
    }

    if (student.role !== Role.STUDENT) {
      return { success: false, message: 'Can only add coins to students' };
    }

    // 3. Add coins to student atomically using raw D1 API
    const updateResult = await env.DB.prepare(
      'UPDATE users_table SET coin_balance = coin_balance + ?1 WHERE id = ?2',
    )
      .bind(amount, studentId)
      .run();

    if (!updateResult.success || updateResult.meta.changes === 0) {
      return { success: false, message: 'Failed to add coins' };
    }

    // 4. Record the transaction audit
    await db.insert(coinTransactionsTable).values({
      userId: studentId,
      amount,
      type: TransactionType.EARN,
      referenceId: userId, // reference to the teacher who added coins
    });

    // 5. Send notification to the student
    await insertNotification(
      db,
      studentId,
      'PROJECT_FUNDED',
      'Coins Received! 🎉',
      `You received ${amount} coins from teacher ${currentUser.userName}. Use them to support projects!`,
      null,
    );

    return {
      success: true,
      message: `Successfully added ${amount} coins to ${student.userName}`,
    };
  } catch (err: unknown) {
    console.error('Add coins error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Transaction failed',
    };
  }
};
