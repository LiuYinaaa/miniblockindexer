import type { Transfer } from '../../types/transfer.js';

export async function upsertTransfers(_transfers: Transfer[]): Promise<void> {
  // TODO: implement batch write for ERC20Transfer model.
}
