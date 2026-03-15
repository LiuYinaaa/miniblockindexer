import { publicClient } from '../blockchain/client.js';
import { insertTransfers } from '../db/repositories/transfersRepository.js';
import { parseERC20Transfer } from './parser.js';
import type { Transfer } from '../types/transfer.js';

export type ProcessBlockResult = {
  blockNumber: bigint;
  transactionsScanned: number;
  transferLogsFound: number;
  transfersInserted: number;
  transfersSkipped: number;
};

export async function processBlock(blockNumber: bigint): Promise<ProcessBlockResult> {
  const block = await publicClient.getBlock({ blockNumber });
  const transfers: Transfer[] = [];

  let transactionsScanned = 0;
  let transferLogsFound = 0;

  for (const txHash of block.transactions) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      transactionsScanned += 1;

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

  const writeResult = await insertTransfers(transfers);

  return {
    blockNumber,
    transactionsScanned,
    transferLogsFound,
    transfersInserted: writeResult.inserted,
    transfersSkipped: writeResult.skipped
  };
}

export async function runSyncerLoop(): Promise<void> {
  // TODO: implement long-running polling worker in next stage.
  console.info('[syncer] use indexBlockRange.ts for current batch indexing flow');
}
