import type { Transaction } from '../../types/transaction.js';
import { prisma } from '../prisma.js';

export type TransactionWriteResult = {
  inserted: number;
  skipped: number;
};

function dedupeTransactions(transactions: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  const unique: Transaction[] = [];

  for (const transaction of transactions) {
    if (seen.has(transaction.hash)) {
      continue;
    }
    seen.add(transaction.hash);
    unique.push(transaction);
  }

  return unique;
}

export async function insertTransactions(transactions: Transaction[]): Promise<TransactionWriteResult> {
  if (transactions.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  const uniqueTransactions = dedupeTransactions(transactions);
  const result = await prisma.transaction.createMany({
    data: uniqueTransactions,
    skipDuplicates: true
  });

  return {
    inserted: result.count,
    skipped: transactions.length - result.count
  };
}

export async function findTransactionByHash(hash: string): Promise<Transaction | null> {
  return prisma.transaction.findUnique({
    where: { hash },
    select: {
      hash: true,
      blockNumber: true,
      fromAddress: true,
      toAddress: true,
      value: true,
      gas: true,
      status: true
    }
  });
}
