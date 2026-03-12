import type { Log } from 'viem';

import type { Transfer } from '../types/transfer.js';

export function parseErc20TransferLog(_log: Log): Transfer | null {
  // TODO: decode ERC20 Transfer(address,address,uint256) topics/data using viem helpers.
  return null;
}
