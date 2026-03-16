import type { FastifyInstance } from 'fastify';

import { getTransactionWithTransfers } from '../../services/transactionService.js';

type TransactionParams = {
  hash: string;
};

function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: TransactionParams }>(
    '/transactions/:hash',
    {
      schema: {
        params: {
          type: 'object',
          required: ['hash'],
          properties: {
            hash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }
          }
        },
        response: {
          200: {
            type: 'object',
            required: ['ok', 'data'],
            properties: {
              ok: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['transaction', 'transfers'],
                properties: {
                  transaction: {
                    type: 'object',
                    required: ['hash', 'blockNumber', 'fromAddress', 'toAddress', 'value', 'gas', 'status'],
                    properties: {
                      hash: { type: 'string' },
                      blockNumber: { type: 'string' },
                      fromAddress: { type: 'string' },
                      toAddress: { type: ['string', 'null'] },
                      value: { type: 'string' },
                      gas: { type: 'string' },
                      status: { type: ['boolean', 'null'] }
                    }
                  },
                  transfers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'txHash',
                        'logIndex',
                        'blockNumber',
                        'tokenAddress',
                        'fromAddress',
                        'toAddress',
                        'amount'
                      ],
                      properties: {
                        txHash: { type: 'string' },
                        logIndex: { type: 'number' },
                        blockNumber: { type: 'string' },
                        tokenAddress: { type: 'string' },
                        fromAddress: { type: 'string' },
                        toAddress: { type: 'string' },
                        amount: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            type: 'object',
            required: ['ok', 'message'],
            properties: {
              ok: { type: 'boolean' },
              message: { type: 'string' }
            }
          },
          404: {
            type: 'object',
            required: ['ok', 'message'],
            properties: {
              ok: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
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
    }
  );
}
