import type { Transaction } from '../../types/transaction.js';

export async function upsertTransactions(_transactions: Transaction[]): Promise<void> {
  // TODO: implement batch write for Transaction model.
}
