export type SyncStateRecord = {
  chainId: number;
  lastSyncedBlock: bigint;
};

export async function getSyncState(_chainId: number): Promise<SyncStateRecord | null> {
  // TODO: read SyncState from database by chainId.
  return null;
}

export async function upsertSyncState(_state: SyncStateRecord): Promise<void> {
  // TODO: write SyncState with upsert semantics.
}
