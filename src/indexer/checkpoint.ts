import { getSyncState, upsertSyncState } from '../db/repositories/syncStateRepository.js';

export type Checkpoint = {
  chainId: number;
  lastSyncedBlock: bigint;
};

export async function getCheckpoint(chainId: number): Promise<Checkpoint | null> {
  const state = await getSyncState(chainId);
  if (!state) {
    return null;
  }

  return {
    chainId: state.chainId,
    lastSyncedBlock: state.lastSyncedBlock
  };
}

export async function setCheckpoint(checkpoint: Checkpoint): Promise<void> {
  await upsertSyncState({
    chainId: checkpoint.chainId,
    lastSyncedBlock: checkpoint.lastSyncedBlock
  });
}
