-- CreateTable
CREATE TABLE "Block" (
    "number" BIGINT NOT NULL,
    "hash" TEXT NOT NULL,
    "parentHash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "txCount" INTEGER NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT,
    "value" TEXT NOT NULL,
    "gas" TEXT NOT NULL,
    "status" BOOLEAN,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "ERC20Transfer" (
    "id" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amount" TEXT NOT NULL,

    CONSTRAINT "ERC20Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lastSyncedBlock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");

-- CreateIndex
CREATE INDEX "Block_timestamp_idx" ON "Block"("timestamp");

-- CreateIndex
CREATE INDEX "Transaction_blockNumber_idx" ON "Transaction"("blockNumber");

-- CreateIndex
CREATE INDEX "Transaction_fromAddress_idx" ON "Transaction"("fromAddress");

-- CreateIndex
CREATE INDEX "Transaction_toAddress_idx" ON "Transaction"("toAddress");

-- CreateIndex
CREATE INDEX "ERC20Transfer_blockNumber_idx" ON "ERC20Transfer"("blockNumber");

-- CreateIndex
CREATE INDEX "ERC20Transfer_tokenAddress_idx" ON "ERC20Transfer"("tokenAddress");

-- CreateIndex
CREATE INDEX "ERC20Transfer_fromAddress_idx" ON "ERC20Transfer"("fromAddress");

-- CreateIndex
CREATE INDEX "ERC20Transfer_toAddress_idx" ON "ERC20Transfer"("toAddress");

-- CreateIndex
CREATE UNIQUE INDEX "ERC20Transfer_txHash_logIndex_key" ON "ERC20Transfer"("txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "SyncState_chainId_key" ON "SyncState"("chainId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_blockNumber_fkey" FOREIGN KEY ("blockNumber") REFERENCES "Block"("number") ON DELETE RESTRICT ON UPDATE CASCADE;
