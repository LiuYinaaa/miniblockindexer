export type Transfer = {
  txHash: string;
  logIndex: number;
  blockNumber: bigint;
  tokenAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
};
