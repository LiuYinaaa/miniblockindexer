export type TransferItem = {
  txHash: string;
  logIndex: number;
  blockNumber: string;
  tokenAddress: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
};

export type AddressTransfersResponse = {
  address: string;
  limit: number;
  offset: number;
  total: number;
  items: TransferItem[];
};

export type TransactionResponse = {
  transaction: {
    hash: string;
    blockNumber: string;
    fromAddress: string;
    toAddress: string | null;
    value: string;
    gas: string;
    status: boolean | null;
  };
  transfers: TransferItem[];
};

export type BlockResponse = {
  block: {
    number: string;
    hash: string;
    parentHash: string;
    timestamp: string;
    txCount: number;
  };
  transferCount: number;
};

type ApiEnvelope<T> = {
  ok: boolean;
  data?: T;
  message?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json = (await res.json()) as ApiEnvelope<T>;

  if (!res.ok || !json.ok || !json.data) {
    throw new Error(json.message ?? `Request failed: ${res.status}`);
  }

  return json.data;
}

export const apiClient = {
  getAddressTransfers(address: string, limit = 20, offset = 0): Promise<AddressTransfersResponse> {
    const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    return request<AddressTransfersResponse>(`/addresses/${address}/transfers?${q.toString()}`);
  },
  getTransaction(hash: string): Promise<TransactionResponse> {
    return request<TransactionResponse>(`/transactions/${hash}`);
  },
  getBlock(number: string): Promise<BlockResponse> {
    return request<BlockResponse>(`/blocks/${number}`);
  }
};
