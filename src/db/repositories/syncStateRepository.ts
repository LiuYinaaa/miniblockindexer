import { prisma } from '../prisma.js';

export type SyncStateRecord = {
  chainId: number;
  lastSyncedBlock: bigint;
};

export async function getSyncState(chainId: number): Promise<SyncStateRecord | null> {
  const record = await prisma.syncState.findUnique({
    where: { chainId },
    select: {
      chainId: true,
      lastSyncedBlock: true
    }
  });

  if (!record) {
    return null;
  }

  return {
    chainId: record.chainId,
    lastSyncedBlock: record.lastSyncedBlock
  };
}

export async function upsertSyncState(state: SyncStateRecord): Promise<void> {
  await prisma.syncState.upsert({
    where: { chainId: state.chainId },
    update: { lastSyncedBlock: state.lastSyncedBlock },
    create: {
      chainId: state.chainId,
      lastSyncedBlock: state.lastSyncedBlock
    }
  });
}
