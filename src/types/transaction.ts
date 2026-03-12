export type Transaction = {
  hash: string;
  blockNumber: bigint;
  fromAddress: string;
  toAddress: string | null;
  value: string;
  gas: string;
  status: boolean | null;
};
