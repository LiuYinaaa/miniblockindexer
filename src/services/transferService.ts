import {
  countTransfersByAddress,
  findTransfersByAddress,
  type TransferListOptions
} from '../db/repositories/transfersRepository.js';

export type AddressTransferListResult = {
  address: string;
  limit: number;
  offset: number;
  total: number;
  items: Array<{
    txHash: string;
    logIndex: number;
    blockNumber: string;
    tokenAddress: string;
    fromAddress: string;
    toAddress: string;
    amount: string;
  }>;
};

export async function listAddressTransfers(
  address: string,
  options: TransferListOptions
): Promise<AddressTransferListResult> {
  const [total, items] = await Promise.all([
    countTransfersByAddress(address),
    findTransfersByAddress(address, options)
  ]);

  return {
    address,
    limit: options.limit,
    offset: options.offset,
    total,
    items: items.map((item) => ({
      txHash: item.txHash,
      logIndex: item.logIndex,
      blockNumber: item.blockNumber.toString(),
      tokenAddress: item.tokenAddress,
      fromAddress: item.fromAddress,
      toAddress: item.toAddress,
      amount: item.amount
    }))
  };
}
