# Ethereum Indexer Explorer (Sepolia)

A Web3 backend/infra learning project for indexing ERC20 `Transfer` events on **Ethereum Sepolia**.

This repo includes:
- a TypeScript indexer service (Fastify + Prisma + PostgreSQL + viem)
- block/transaction/transfer persistence
- checkpoint-based range indexing
- query APIs with request/response schema validation
- a lightweight React explorer UI

## 1. Project Overview

This project is designed to learn and demonstrate practical indexer engineering patterns:
- ingest on-chain data from RPC
- normalize and persist into relational storage
- expose query APIs for downstream consumers
- keep indexing resumable via checkpoint state

It is intentionally scoped to a single chain (Sepolia) and a single event family (ERC20 transfers) to keep architecture understandable.

## 2. Features

- ERC20 Transfer parsing from logs (`Transfer(address,address,uint256)`)
- Block / Transaction / ERC20Transfer persistence in PostgreSQL
- Idempotent writes using unique constraints + `skipDuplicates`/upsert patterns
- Checkpoint tracking via `SyncState` (`chainId -> lastSyncedBlock`)
- Range indexing script (`START_BLOCK` or checkpoint -> latest block)
- Experimental `getLogs` indexing path for faster transfer ingestion over ranges
- Fastify query APIs:
  - address transfers
  - transaction + transfers
  - block details + transfer count
- JSON schema validation for params/query/response
- API smoke test script
- React explorer page for manual querying

## 3. Architecture

```text
RPC (Sepolia) via viem
   -> indexer scripts / sync core
   -> parser (ERC20 transfer)
   -> repositories (Prisma)
   -> PostgreSQL
   -> Fastify API
   -> React Explorer
```

Backend modules:
- `src/indexer`: block processing, parsing, checkpoint helpers
- `src/db/repositories`: isolated DB read/write operations
- `src/api/routes`: HTTP handlers + schema
- `src/services`: query composition for API responses
- `src/scripts`: operational scripts (indexing/testing/debug)
- `frontend/`: lightweight explorer UI

## 4. Data Flow

### Receipt-based indexing path (current baseline)
1. Load start block from `SyncState` or `START_BLOCK`
2. Iterate blocks to latest
3. For each block:
   - fetch block + transactions
   - fetch each tx receipt
   - parse transfer logs
   - persist Block / Transaction / ERC20Transfer
4. Update checkpoint after each successfully processed block

### getLogs-based indexing path (experimental)
1. Query logs by block chunks with `topic0 = ERC20 Transfer signature`
2. Parse logs into transfer records
3. Bulk insert transfers with idempotent semantics

## 5. Database Schema Overview

Core tables:
- `Block`: `number`, `hash`, `parentHash`, `timestamp`, `txCount`
- `Transaction`: `hash`, `blockNumber`, `fromAddress`, `toAddress`, `value`, `gas`, `status`
- `ERC20Transfer`: `txHash`, `logIndex`, `blockNumber`, `tokenAddress`, `fromAddress`, `toAddress`, `amount`
- `SyncState`: `chainId`, `lastSyncedBlock`, `updatedAt`

Key constraints/indexes:
- `ERC20Transfer @@unique([txHash, logIndex])`
- indexes on `ERC20Transfer.blockNumber/tokenAddress/fromAddress/toAddress`
- index on `Transaction.blockNumber`
- `SyncState.chainId` unique

## 6. API Endpoints

Base server: `src/main.ts` / Fastify

- `GET /addresses/:address/transfers?limit=20&offset=0`
  - Returns transfers where address matches `fromAddress` or `toAddress`
- `GET /transactions/:hash`
  - Returns transaction details + transfer list in that tx
- `GET /blocks/:number`
  - Returns block details + transfer count
- `GET /health`
  - Basic health endpoint

Notes:
- params/query validation uses Fastify JSON schema
- response schemas are defined for `200/400/404`
- BigInt fields are serialized as strings in API responses

## 7. Frontend Explorer

A minimal React UI is provided in `frontend/`:
- page title: **Ethereum Indexer Explorer**
- sections:
  - Search Address Transfers
  - Search Transaction
  - Search Block
- includes loading/error/empty states
- API calls are centralized in `frontend/src/api/client.ts`

By default, Vite proxies `/api` to `http://localhost:3000`.

## 8. Local Development

### Backend

```bash
pnpm install
cp .env.example .env
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm run dev
```

Required envs:
- `PORT`
- `DATABASE_URL`
- `RPC_URL`
- `CHAIN_ID` (Sepolia: `11155111`)
- `START_BLOCK`
- `POLL_INTERVAL_MS`

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## 9. Testing

- API smoke tests:
```bash
pnpm run test:api
```

- Build/type check:
```bash
pnpm run build
cd frontend && pnpm run build
```

- Indexing scripts:
```bash
pnpm run test                 # range indexing (receipt-based)
pnpm run test:index-logs      # getLogs-based transfer indexing (experimental)
```

## 10. Performance Notes

- Current baseline path is receipt-based and RPC-heavy (one receipt call per tx)
- Experimental `getLogs` path can be significantly faster for transfer-only ingestion
- Writes use bulk insert + duplicate skipping for stable re-runs
- On free RPC tiers, `eth_getLogs` range is limited (script chunks requests accordingly)

## 11. Current Limitations

- No reorg handling yet
- No continuous worker loop with retries/backoff strategy
- No token metadata enrichment/decimals normalization
- No auth/rate-limit layer on public API
- Explorer is demo-level UI only
- Single-chain scope (Sepolia only)

## 12. Future Improvements

- Add reorg-safe indexing strategy (confirmations + rollback)
- Add robust sync worker (queue, retry policy, observability)
- Add more query filters (token, block ranges, paging cursors)
- Add token metadata + normalized human-readable amounts
- Add integration tests with seeded fixtures
- Extend to multi-network indexing

---

This project is intentionally built as a learning-first portfolio backend: practical, traceable, and easy to iterate on.
