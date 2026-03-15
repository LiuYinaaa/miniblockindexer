import { publicClient } from '../blockchain/client.js';
import { parseERC20Transfer } from '../indexer/parser.js';
import { insertTransfers } from '../db/repositories/transfersRepository.js';
import type { Transfer } from '../types/transfer.js';

async function main(): Promise<void> {
  const latestBlockNumber = await publicClient.getBlockNumber();
  const latestBlock = await publicClient.getBlock({ blockNumber: latestBlockNumber });

  const txHashes = latestBlock.transactions;
  const collectedTransfers: Transfer[] = [];

  let scannedTransactions = 0;
  let transferLogsFound = 0;

  console.log('=== Index One Block (ERC20 Transfer) ===');
  console.log(`Block Number            : ${latestBlockNumber.toString()}`);
  console.log(`Transactions In Block   : ${txHashes.length}`);

  for (const txHash of txHashes) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      scannedTransactions += 1;

      for (const log of receipt.logs) {
        const parsed = parseERC20Transfer(log);
        if (!parsed) {
          continue;
        }

        transferLogsFound += 1;
        collectedTransfers.push({
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
      console.warn(`Skip transaction receipt due to error: ${String(txHash)}`);
      console.warn(error);
    }
  }

  const writeResult = await insertTransfers(collectedTransfers);

  console.log('\n=== Index Summary ===');
  console.log(`Block Number            : ${latestBlockNumber.toString()}`);
  console.log(`Transactions Scanned    : ${scannedTransactions}`);
  console.log(`Transfer Logs Found     : ${transferLogsFound}`);
  console.log(`Transfers Inserted      : ${writeResult.inserted}`);
  console.log(`Skipped / Duplicates    : ${writeResult.skipped}`);

  if (transferLogsFound === 0) {
    console.log('Result                  : ERC20 Transfer not found in this block');
  }
}

main().catch((error) => {
  console.error('Failed to index one block:', error);
  process.exit(1);
});
