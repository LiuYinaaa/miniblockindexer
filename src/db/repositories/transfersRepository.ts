import type { Transfer } from '../../types/transfer.js';
import { prisma } from '../prisma.js';

export type TransferWriteResult = {
  inserted: number;
  skipped: number;
};

function dedupeTransfers(transfers: Transfer[]): Transfer[] {
  const seen = new Set<string>();
  const unique: Transfer[] = [];

  for (const transfer of transfers) {
    const key = `${transfer.txHash}:${transfer.logIndex}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(transfer);
  }

  return unique;
}

export async function insertTransfer(transfer: Transfer): Promise<TransferWriteResult> {
  return insertTransfers([transfer]);
}

export async function insertTransfers(transfers: Transfer[]): Promise<TransferWriteResult> {
  if (transfers.length === 0) {
    return { inserted: 0, skipped: 0 };
  }

  const uniqueTransfers = dedupeTransfers(transfers);
  const result = await prisma.eRC20Transfer.createMany({
    data: uniqueTransfers,
    skipDuplicates: true
  });

  return {
    inserted: result.count,
    skipped: transfers.length - result.count
  };
}

export type TransferListOptions = {
  limit: number;
  offset: number;
};

export async function findTransfersByAddress(
  address: string,
  options: TransferListOptions
): Promise<Transfer[]> {
  return prisma.eRC20Transfer.findMany({
    where: {
      OR: [{ fromAddress: address }, { toAddress: address }]
    },
    orderBy: [{ blockNumber: 'desc' }, { logIndex: 'desc' }],
    take: options.limit,
    skip: options.offset,
    select: {
      txHash: true,
      logIndex: true,
      blockNumber: true,
      tokenAddress: true,
      fromAddress: true,
      toAddress: true,
      amount: true
    }
  });
}

export async function countTransfersByAddress(address: string): Promise<number> {
  return prisma.eRC20Transfer.count({
    where: {
      OR: [{ fromAddress: address }, { toAddress: address }]
    }
  });
}

export async function findTransfersByTransactionHash(txHash: string): Promise<Transfer[]> {
  return prisma.eRC20Transfer.findMany({
    where: { txHash },
    orderBy: [{ logIndex: 'asc' }],
    select: {
      txHash: true,
      logIndex: true,
      blockNumber: true,
      tokenAddress: true,
      fromAddress: true,
      toAddress: true,
      amount: true
    }
  });
}

export async function countTransfersByBlockNumber(blockNumber: bigint): Promise<number> {
  return prisma.eRC20Transfer.count({
    where: { blockNumber }
  });
}
