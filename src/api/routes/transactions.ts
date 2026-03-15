import type { FastifyInstance } from 'fastify';

import { getTransactionWithTransfers } from '../../services/transactionService.js';

type TransactionParams = {
  hash: string;
};

function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: TransactionParams }>('/transactions/:hash', async (request, reply) => {
    const txHash = request.params.hash;
    if (!isValidTxHash(txHash)) {
      return reply.code(400).send({
        ok: false,
        message: 'Invalid transaction hash format.'
      });
    }

    const result = await getTransactionWithTransfers(txHash);
    if (!result) {
      return reply.code(404).send({
        ok: false,
        message: 'Transaction not found.'
      });
    }

    return reply.send({
      ok: true,
      data: result
    });
  });
}
