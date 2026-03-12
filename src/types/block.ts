export type Block = {
  number: bigint;
  hash: string;
  parentHash: string;
  timestamp: Date;
  txCount: number;
};
