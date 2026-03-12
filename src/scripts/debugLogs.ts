import { publicClient } from '../blockchain/client.js';
import { parseERC20Transfer } from '../indexer/parser.js';

async function main(): Promise<void> {
  const latestBlockNumber = await publicClient.getBlockNumber();
  const latestBlock = await publicClient.getBlock({ blockNumber: latestBlockNumber });

  const txHashes = latestBlock.transactions;
  let scannedReceipts = 0;
  let matchedTransferLogs = 0;

  console.log('=== ERC20 Transfer Logs Scan ===');
  console.log(`Block Number             : ${latestBlockNumber.toString()}`);
  console.log(`Transaction Total        : ${txHashes.length}`);

  for (const txHash of txHashes) {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      scannedReceipts += 1;

      for (const log of receipt.logs) {
        const parsedTransfer = parseERC20Transfer(log);
        if (!parsedTransfer) {
          continue;
        }

        matchedTransferLogs += 1;

        console.log(`\n[ERC20 Transfer #${matchedTransferLogs}]`);
        console.log(`block number             : ${parsedTransfer.blockNumber.toString()}`);
        console.log(`transaction hash         : ${parsedTransfer.txHash}`);
        console.log(`log address              : ${parsedTransfer.tokenAddress}`);
        console.log(`from                     : ${parsedTransfer.from}`);
        console.log(`to                       : ${parsedTransfer.to}`);
        console.log(`amount (uint256)         : ${parsedTransfer.amount.toString()}`);
        console.log(`topics                   : ${JSON.stringify(log.topics)}`);
        console.log(`data                     : ${log.data}`);
        console.log(`logIndex                 : ${parsedTransfer.logIndex}`);
      }
    } catch (error) {
      console.warn(`Skip tx receipt due to error: ${String(txHash)}`);
      console.warn(error);
    }
  }

  console.log('\n=== Scan Summary ===');
  console.log(`Transaction Total        : ${txHashes.length}`);
  console.log(`Receipts Scanned         : ${scannedReceipts}`);
  console.log(`Transfer Logs Found      : ${matchedTransferLogs}`);

  if (matchedTransferLogs === 0) {
    console.log('ERC20 Transfer logs: not found');
  }
}

main().catch((error) => {
  console.error('Failed to scan ERC20 Transfer logs:', error);
  process.exit(1);
});
