import { env } from '../config/env.js';
import { getCheckpoint, setCheckpoint } from '../indexer/checkpoint.js';
import { processBlock } from '../indexer/syncer.js';
import { publicClient } from '../blockchain/client.js';

async function main(): Promise<void> {
  const latestBlockNumber = await publicClient.getBlockNumber();
  const checkpoint = await getCheckpoint(env.chainId);

  const startBlock = checkpoint ? checkpoint.lastSyncedBlock + 1n : env.startBlock;

  console.log('=== Index Block Range (ERC20 Transfer) ===');
  console.log(`Chain ID                 : ${env.chainId}`);
  console.log(`Latest Block             : ${latestBlockNumber.toString()}`);
  console.log(`Checkpoint               : ${checkpoint ? checkpoint.lastSyncedBlock.toString() : 'not found'}`);
  console.log(`Start Block              : ${startBlock.toString()}`);

  if (startBlock > latestBlockNumber) {
    console.log('No new blocks to process.');
    return;
  }

  let processedBlocks = 0;
  let totalTransfersFound = 0;
  let totalTransfersInserted = 0;
  let totalTransfersSkipped = 0;
  let totalTransactionsScanned = 0;

  for (let blockNumber = startBlock; blockNumber <= latestBlockNumber; blockNumber += 1n) {
    console.log(`\n[process] block=${blockNumber.toString()}`);

    const result = await processBlock(blockNumber);

    processedBlocks += 1;
    totalTransactionsScanned += result.transactionsScanned;
    totalTransfersFound += result.transferLogsFound;
    totalTransfersInserted += result.transfersInserted;
    totalTransfersSkipped += result.transfersSkipped;

    console.log(
      `[block result] tx=${result.transactionsScanned} transfers=${result.transferLogsFound} inserted=${result.transfersInserted} skipped=${result.transfersSkipped}`
    );

    await setCheckpoint({
      chainId: env.chainId,
      lastSyncedBlock: blockNumber
    });

    console.log(`[checkpoint] updated to block ${blockNumber.toString()}`);
  }

  console.log('\n=== Range Summary ===');
  console.log(`Blocks Processed          : ${processedBlocks}`);
  console.log(`Transactions Scanned      : ${totalTransactionsScanned}`);
  console.log(`Transfer Logs Found       : ${totalTransfersFound}`);
  console.log(`Transfers Inserted        : ${totalTransfersInserted}`);
  console.log(`Transfers Skipped         : ${totalTransfersSkipped}`);
  console.log(`Final Checkpoint          : ${latestBlockNumber.toString()}`);
}

main().catch((error) => {
  console.error('Failed to index block range:', error);
  process.exit(1);
});
