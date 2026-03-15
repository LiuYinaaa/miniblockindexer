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
