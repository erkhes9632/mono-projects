import { eq, sql } from 'drizzle-orm';
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
} from '../../../types';

export const stakeCoins: MutationResolvers['stakeCoins'] = async (
  _,
  { projectId, studentId, amount },
  { db, userId },
) => {
  if (!userId) {
    throw new GraphQLError('You need to SignIn', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (amount <= 0) {
    throw new GraphQLError('Not enough coin');
  }

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, userId));
      if (!user || user.coinBalance < amount) {
        return {
          success: false,
          message: 'Not enough coin in your wallet',
        };
      }

      const [project] = await tx
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, projectId));
      if (!project) {
        return { success: false, message: 'Can not Find' };
      }

      if (project.status !== ProjectStatus.APPROVED) {
        return {
          success: false,
          message: 'You can not access.',
        };
      }

      await tx
        .update(usersTable)
        .set({ coinBalance: sql`${usersTable.coinBalance} - ${amount}` })
        .where(eq(usersTable.id, userId));

      await tx
        .update(projectsTable)
        .set({
          totalCoinsCollected: sql`${projectsTable.totalCoinsCollected} + ${amount}`,
        })
        .where(eq(projectsTable.id, projectId));

      await tx.insert(fundingsTable).values({
        projectId,
        studentId: userId,
        coinAmount: amount,
      });

      await tx.insert(coinTransactionsTable).values({
        userId,
        amount: amount,
        type: TransactionType.STAKE,
        referenceId: projectId,
      });

      return {
        success: true,
        message: 'Succesfully donated , Thank you',
      };
    });
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Error',
    };
  }
};
