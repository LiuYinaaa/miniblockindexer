import { buildServer } from '../api/server.js';
import { prisma } from '../db/prisma.js';

async function runCase(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

function expectStatus(actual: number, expected: number, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected status ${expected}, got ${actual}`);
  }
}

async function main(): Promise<void> {
  const app = buildServer();
  await app.ready();

  console.log('=== API Smoke Test ===');

  await runCase('GET /addresses/:address/transfers invalid address -> 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/addresses/not-an-address/transfers'
    });
    expectStatus(res.statusCode, 400, 'invalid address');
  });

  await runCase('GET /transactions/:hash invalid hash -> 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/transactions/0x1234'
    });
    expectStatus(res.statusCode, 400, 'invalid tx hash');
  });

  await runCase('GET /blocks/:number invalid number -> 400', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/blocks/abc'
    });
    expectStatus(res.statusCode, 400, 'invalid block number');
  });

  const sampleTransfer = await prisma.eRC20Transfer.findFirst({
    orderBy: { blockNumber: 'desc' }
  });
  const sampleTx = await prisma.transaction.findFirst({
    orderBy: { blockNumber: 'desc' }
  });
  const sampleBlock = await prisma.block.findFirst({
    orderBy: { number: 'desc' }
  });

  await runCase('GET /addresses/:address/transfers data path', async () => {
    const testAddress = sampleTransfer?.toAddress ?? '0x000000000000000000000000000000000000dead';
    const expectedStatus = sampleTransfer ? 200 : 404;

    const res = await app.inject({
      method: 'GET',
      url: `/addresses/${testAddress}/transfers?limit=5&offset=0`
    });

    expectStatus(res.statusCode, expectedStatus, 'address transfers');
  });

  await runCase('GET /transactions/:hash data path', async () => {
    const testHash = sampleTx?.hash ?? `0x${'0'.repeat(64)}`;
    const expectedStatus = sampleTx ? 200 : 404;

    const res = await app.inject({
      method: 'GET',
      url: `/transactions/${testHash}`
    });

    expectStatus(res.statusCode, expectedStatus, 'transaction details');
  });

  await runCase('GET /blocks/:number data path', async () => {
    const testNumber = sampleBlock?.number.toString() ?? '0';
    const expectedStatus = sampleBlock ? 200 : 404;

    const res = await app.inject({
      method: 'GET',
      url: `/blocks/${testNumber}`
    });

    expectStatus(res.statusCode, expectedStatus, 'block details');
  });

  await app.close();
  await prisma.$disconnect();

  console.log('=== API Smoke Test Done ===');
}

main().catch(async (error) => {
  console.error('API smoke test crashed');
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
