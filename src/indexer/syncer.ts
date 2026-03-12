import { env } from '../config/env.js';

export async function runSyncerLoop(): Promise<void> {
  // TODO: implement polling loop:
  // 1) read checkpoint from db
  // 2) fetch new blocks
  // 3) parse + persist
  // 4) update checkpoint
  console.info('[syncer] placeholder loop started', {
    pollIntervalMs: env.pollIntervalMs
  });
}
