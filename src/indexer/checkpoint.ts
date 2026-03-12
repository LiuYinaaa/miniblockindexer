export type Checkpoint = {
  chainId: number;
  lastSyncedBlock: bigint;
};

export async function getCheckpoint(_chainId: number): Promise<Checkpoint | null> {
  // TODO: load checkpoint from SyncState repository.
  return null;
}

export async function setCheckpoint(_checkpoint: Checkpoint): Promise<void> {
  // TODO: persist checkpoint into SyncState repository.
}
