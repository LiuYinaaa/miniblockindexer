import dotenv from 'dotenv';

dotenv.config();

type AppEnv = {
  port: number;
  databaseUrl: string;
  rpcUrl: string;
  chainId: number;
  startBlock: bigint;
  pollIntervalMs: number;
};

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readNumber(name: string): number {
  const raw = readRequired(name);
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable ${name} must be a valid number.`);
  }
  return value;
}

function readBigInt(name: string): bigint {
  const raw = readRequired(name);
  try {
    return BigInt(raw);
  } catch {
    throw new Error(`Environment variable ${name} must be a valid integer.`);
  }
}

export const env: AppEnv = {
  port: readNumber('PORT'),
  databaseUrl: readRequired('DATABASE_URL'),
  rpcUrl: readRequired('RPC_URL'),
  chainId: readNumber('CHAIN_ID'),
  startBlock: readBigInt('START_BLOCK'),
  pollIntervalMs: readNumber('POLL_INTERVAL_MS')
};
