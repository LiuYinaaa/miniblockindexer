import { findTransfersByTransactionHash } from '../db/repositories/transfersRepository.js';
import { findTransactionByHash } from '../db/repositories/transactionsRepository.js';

export type TransactionWithTransfers = {
  transaction: {
    hash: string;
    blockNumber: string;
    fromAddress: string;
    toAddress: string | null;
    value: string;
    gas: string;
    status: boolean | null;
  };
  transfers: Array<{
    txHash: string;
    logIndex: number;
    blockNumber: string;
    tokenAddress: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
  }>;
};

export async function getTransactionWithTransfers(hash: string): Promise<TransactionWithTransfers | null> {
  const transaction = await findTransactionByHash(hash);
  if (!transaction) {
    return null;
  }

  const transfers = await findTransfersByTransactionHash(hash);
  return {
    transaction: {
      hash: transaction.hash,
      blockNumber: transaction.blockNumber.toString(),
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      value: transaction.value,
      gas: transaction.gas,
      status: transaction.status
    },
    transfers: transfers.map((item) => ({
      txHash: item.txHash,
      logIndex: item.logIndex,
      blockNumber: item.blockNumber.toString(),
      tokenAddress: item.tokenAddress,
      fromAddress: item.fromAddress,
      toAddress: item.toAddress,
      amount: item.amount
    }))
  };
}
