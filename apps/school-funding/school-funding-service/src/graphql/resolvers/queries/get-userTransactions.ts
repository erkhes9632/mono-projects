import { eq, desc } from 'drizzle-orm';
import { coinTransactionsTable } from '../../../db/schema';
import { QueryResolvers, TransactionType } from '../../../types';
import { GraphQLError } from 'graphql';

export const getUserTransactions: QueryResolvers['getUserTransactions'] =
  async (_, { userId: targetUserId }, { db, userId }) => {
    if (!userId) {
      throw new GraphQLError('Нэвтрэх шаардлагатай.', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    try {
      const transactions = await db
        .select()
        .from(coinTransactionsTable)
        .where(eq(coinTransactionsTable.userId, targetUserId || userId))
        .orderBy(desc(coinTransactionsTable.createdAt));

      return transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        amount: t.amount,
        type: t.type as TransactionType,
        referenceId: t.referenceId ?? null,
        createdAt: t.createdAt,
      }));
    } catch (err: unknown) {
      return [];
    }
  };
