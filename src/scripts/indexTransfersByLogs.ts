import { env } from '../config/env.js';
import { publicClient } from '../blockchain/client.js';
import { ERC20_TRANSFER_TOPIC0, parseERC20Transfer } from '../indexer/parser.js';
import { insertTransfers } from '../db/repositories/transfersRepository.js';
import type { Transfer } from '../types/transfer.js';

type CliOptions = {
  fromBlock?: bigint;
  toBlock?: bigint;
  chunkSize?: bigint;
};
const MAX_FREE_TIER_LOG_RANGE = 10n;

function parseCliOptions(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (const arg of argv) {
    if (arg.startsWith('--fromBlock=')) {
      options.fromBlock = BigInt(arg.slice('--fromBlock='.length));
      continue;
    }

    if (arg.startsWith('--toBlock=')) {
      options.toBlock = BigInt(arg.slice('--toBlock='.length));
      continue;
    }

    if (arg.startsWith('--chunkSize=')) {
      options.chunkSize = BigInt(arg.slice('--chunkSize='.length));
    }
  }

  return options;
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  const args = parseCliOptions(process.argv.slice(2));

  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = args.fromBlock ?? env.startBlock;
  const toBlock = args.toBlock ?? latestBlock;
  let chunkSize = args.chunkSize ?? MAX_FREE_TIER_LOG_RANGE;

  if (fromBlock > toBlock) {
    throw new Error(`Invalid range: fromBlock(${fromBlock.toString()}) > toBlock(${toBlock.toString()})`);
  }
  if (chunkSize <= 0n) {
    throw new Error(`Invalid chunkSize(${chunkSize.toString()}).`);
  }
  if (chunkSize > MAX_FREE_TIER_LOG_RANGE) {
    console.warn(
      `Requested chunkSize=${chunkSize.toString()} exceeds free-tier eth_getLogs limit. ` +
        `Fallback to ${MAX_FREE_TIER_LOG_RANGE.toString()}.`
    );
    chunkSize = MAX_FREE_TIER_LOG_RANGE;
  }

  console.log('=== Index Transfers By getLogs (Experimental) ===');
  console.log(`Chain ID                 : ${env.chainId}`);
  console.log(`From Block               : ${fromBlock.toString()}`);
  console.log(`To Block                 : ${toBlock.toString()}`);
  console.log(`Chunk Size               : ${chunkSize.toString()}`);
  console.log(`RPC Limit (free tier)    : ${MAX_FREE_TIER_LOG_RANGE.toString()} blocks/request`);

  const transfers: Transfer[] = [];
  let rawLogsFetched = 0;
  let parseFailed = 0;

  for (let chunkStart = fromBlock; chunkStart <= toBlock; chunkStart += chunkSize) {
    const chunkEnd = chunkStart + chunkSize - 1n > toBlock ? toBlock : chunkStart + chunkSize - 1n;
    const logs = await publicClient.getLogs({
      fromBlock: chunkStart,
      toBlock: chunkEnd,
      topics: [ERC20_TRANSFER_TOPIC0]
    } as any);

    rawLogsFetched += logs.length;
    console.log(
      `[chunk] ${chunkStart.toString()}-${chunkEnd.toString()} logs=${logs.length} cumulative=${rawLogsFetched}`
    );

    for (const log of logs) {
      const parsed = parseERC20Transfer(log);
      if (!parsed) {
        parseFailed += 1;
        continue;
      }

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
  }

  const writeResult = await insertTransfers(transfers);
  const elapsedMs = Date.now() - startedAt;

  console.log('\n=== getLogs Index Summary ===');
  console.log(`Raw Logs Fetched          : ${rawLogsFetched}`);
  console.log(`Transfer Parsed           : ${transfers.length}`);
  console.log(`Parse Failed              : ${parseFailed}`);
  console.log(`Transfers Inserted        : ${writeResult.inserted}`);
  console.log(`Transfers Skipped         : ${writeResult.skipped}`);
  console.log(`Elapsed (ms)              : ${elapsedMs}`);
  console.log(
    `Throughput (logs/s)       : ${elapsedMs > 0 ? ((rawLogsFetched * 1000) / elapsedMs).toFixed(2) : 'N/A'}`
  );
  console.log('\nCompare baseline: run `pnpm run test` (receipt-based indexBlockRange).');
}

main().catch((error) => {
  console.error('Failed to index transfers by getLogs:', error);
  process.exit(1);
});
