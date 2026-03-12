import { publicClient } from '../blockchain/client.js';

function formatTimestamp(seconds: bigint): string {
  const ms = Number(seconds) * 1000;
  return new Date(ms).toISOString();
}

async function main(): Promise<void> {
  const latestBlockNumber = await publicClient.getBlockNumber();
  const latestBlock = await publicClient.getBlock({
    blockNumber: latestBlockNumber
  });

  console.log("==E==")
  console.log(latestBlock)

  const txCount = latestBlock.transactions.length;

  console.log('=== Ethereum Latest Block Debug ===');
  console.log(`Block Number      : ${latestBlock.number?.toString() ?? latestBlockNumber.toString()}`);
  console.log(`Block Hash        : ${latestBlock.hash ?? 'N/A'}`);
  console.log(`Timestamp         : ${formatTimestamp(latestBlock.timestamp)}`);
  console.log(`Transaction Count : ${txCount}`);
}

main().catch((error) => {
  console.error('Failed to fetch latest block:', error);
  process.exit(1);
});
