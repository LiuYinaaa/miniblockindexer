import type { Block } from '../types/block.js';
import type { Transaction } from '../types/transaction.js';

export type ParsedBlockBundle = {
  block: Block;
  transactions: Transaction[];
};

export function parseBlockBundle(): ParsedBlockBundle | null {
  // TODO: map raw viem block payload into internal typed models.
  return null;
}
