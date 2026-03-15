import { findBlockByNumber } from '../db/repositories/blocksRepository.js';
import { countTransfersByBlockNumber } from '../db/repositories/transfersRepository.js';

export type BlockDetails = {
  block: {
    number: string;
    hash: string;
    parentHash: string;
    timestamp: string;
    txCount: number;
  };
  transferCount: number;
};

export async function getBlockDetails(blockNumber: bigint): Promise<BlockDetails | null> {
  const block = await findBlockByNumber(blockNumber);
  if (!block) {
    return null;
  }

  const transferCount = await countTransfersByBlockNumber(blockNumber);
  return {
    block: {
      number: block.number.toString(),
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp.toISOString(),
      txCount: block.txCount
    },
    transferCount
  };
}
