import type { Block } from '../../types/block.js';
import { prisma } from '../prisma.js';

export async function upsertBlock(block: Block): Promise<void> {
  await prisma.block.upsert({
    where: { number: block.number },
    update: {
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      txCount: block.txCount
    },
    create: {
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      txCount: block.txCount
    }
  });
}
