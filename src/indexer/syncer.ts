import { publicClient } from '../blockchain/client.js';
import { upsertBlock } from '../db/repositories/blocksRepository.js';
import { insertTransfers } from '../db/repositories/transfersRepository.js';
import { insertTransactions } from '../db/repositories/transactionsRepository.js';
import { parseERC20Transfer } from './parser.js';
import type { Block } from '../types/block.js';
import type { Transfer } from '../types/transfer.js';
import type { Transaction } from '../types/transaction.js';

export type ProcessBlockResult = {
  blockNumber: bigint;
  transactionsScanned: number;
  transactionsInserted: number;
  transactionsSkipped: number;
  transferLogsFound: number;
  transfersInserted: number;
  transfersSkipped: number;
};

export async function processBlock(blockNumber: bigint): Promise<ProcessBlockResult> {
  const block = await publicClient.getBlock({
    blockNumber,
    includeTransactions: true
  });
  if (!block.hash) {
    throw new Error(`Block hash is null for block ${blockNumber.toString()}`);
  }

  const blockRecord: Block = {
    number: blockNumber,
    hash: block.hash,
    parentHash: block.parentHash,
    timestamp: new Date(Number(block.timestamp) * 1000),
    txCount: block.transactions.length
  };

  await upsertBlock(blockRecord);

  const transfers: Transfer[] = [];
  const transactions: Transaction[] = [];

  let transactionsScanned = 0;
  let transferLogsFound = 0;

  for (const tx of block.transactions) {
    const txHash = tx.hash;
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      transactionsScanned += 1;
      transactions.push({
        hash: txHash,
        blockNumber,
        fromAddress: tx.from,
        toAddress: tx.to,
        value: tx.value.toString(),
        gas: tx.gas.toString(),
        status: receipt.status === 'success' ? true : receipt.status === 'reverted' ? false : null
      });

      for (const log of receipt.logs) {
        const parsed = parseERC20Transfer(log);
        if (!parsed) {
          continue;
        }

        transferLogsFound += 1;
        transfers.push({
          txHash: parsed.txHash,
          logIndex: parsed.logIndex,
          blockNumber: parsed.blockNumber,
          tokenAddress: parsed.tokenAddress,
          fromAddress: parsed.from,
          toAddress: parsed.to,
          amount: parsed.amount.toString()
        });
      }
    } catch (error) {
      console.warn(`[processBlock] failed to get receipt for tx ${String(txHash)}`);
      console.warn(error);
    }
  }

  const txWriteResult = await insertTransactions(transactions);
  const writeResult = await insertTransfers(transfers);

  return {
    blockNumber,
    transactionsScanned,
    transactionsInserted: txWriteResult.inserted,
    transactionsSkipped: txWriteResult.skipped,
    transferLogsFound,
    transfersInserted: writeResult.inserted,
    transfersSkipped: writeResult.skipped
  };
}

export async function runSyncerLoop(): Promise<void> {
  // TODO: implement long-running polling worker in next stage.
  console.info('[syncer] use indexBlockRange.ts for current batch indexing flow');
}
