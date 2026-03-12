import { getAddress, hexToBigInt, type Log } from 'viem';

import type { Block } from '../types/block.js';
import type { Transaction } from '../types/transaction.js';

export const ERC20_TRANSFER_TOPIC0 =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export type ParsedBlockBundle = {
  block: Block;
  transactions: Transaction[];
};

export type ParsedERC20Transfer = {
  tokenAddress: string;
  from: string;
  to: string;
  amount: bigint;
  txHash: string;
  logIndex: number;
  blockNumber: bigint;
};

function parseIndexedAddress(topic: `0x${string}`): string {
  // Indexed address is ABI-encoded as 32 bytes, with the last 20 bytes as the address.
  const addressHex = `0x${topic.slice(26)}` as `0x${string}`;
  return getAddress(addressHex);
}

export function parseERC20Transfer(log: Log): ParsedERC20Transfer | null {
  if (log.topics[0]?.toLowerCase() !== ERC20_TRANSFER_TOPIC0) {
    return null;
  }

  const fromTopic = log.topics[1];
  const toTopic = log.topics[2];

  if (!fromTopic || !toTopic || !log.transactionHash || log.logIndex == null || log.blockNumber == null) {
    return null;
  }

  try {
    return {
      tokenAddress: getAddress(log.address),
      from: parseIndexedAddress(fromTopic),
      to: parseIndexedAddress(toTopic),
      amount: hexToBigInt(log.data),
      txHash: log.transactionHash,
      logIndex: log.logIndex,
      blockNumber: log.blockNumber
    };
  } catch {
    return null;
  }
}

export function parseBlockBundle(): ParsedBlockBundle | null {
  // TODO: map raw viem block payload into internal typed models.
  return null;
}
