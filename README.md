# miniblockindexer

A minimal TypeScript starter for building an EVM / Ethereum on-chain data indexer backend.

## Project Overview

This project provides a clean foundation for a Web3 backend / infra service:
- blockchain RPC access via `viem`
- REST API service via `Fastify`
- database access via `Prisma` + `PostgreSQL`
- modular indexer components for block sync, parsing, and checkpointing

Current stage focuses on project structure and engineering scaffolding only.

## Directory Structure

```text
miniblockindexer/
  package.json
  tsconfig.json
  README.md
  prisma/
    schema.prisma
  src/
    main.ts
    config/
      env.ts
    blockchain/
      client.ts
      erc20.ts
    indexer/
      syncer.ts
      parser.ts
      checkpoint.ts
    db/
      prisma.ts
      repositories/
        blocksRepository.ts
        transactionsRepository.ts
        transfersRepository.ts
        syncStateRepository.ts
    api/
      server.ts
      routes/
        health.ts
        transfers.ts
        transactions.ts
        blocks.ts
    services/
      transferService.ts
    types/
      transfer.ts
      block.ts
      transaction.ts
```

## Tech Stack

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- viem
- dotenv

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from your env template and fill required values.

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run migration for local database (if needed):

```bash
npm run prisma:migrate
```

5. Start development server:

```bash
npm run dev
```

Health check endpoint:

```text
GET /health
```

## Roadmap

- Implement block sync loop with checkpoint persistence
- Parse transactions and logs from indexed blocks
- Decode ERC20 `Transfer` events
- Persist blocks / transactions / transfers into PostgreSQL
- Expose query APIs for blocks, transactions, and transfers
