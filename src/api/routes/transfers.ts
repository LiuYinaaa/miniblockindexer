import type { FastifyInstance } from 'fastify';
import { getAddress } from 'viem';

import { listAddressTransfers } from '../../services/transferService.js';

type AddressTransfersParams = {
  address: string;
};

type AddressTransfersQuery = {
  limit?: string;
  offset?: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const ADDRESS_PATTERN = '^0x[a-fA-F0-9]{40}$';

function parsePositiveInteger(raw: string | undefined, fallback: number): number {
  if (raw == null) {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('must be a non-negative integer');
  }
  return value;
}

export async function transferRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: AddressTransfersParams; Querystring: AddressTransfersQuery }>(
    '/addresses/:address/transfers',
    {
      schema: {
        params: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string', pattern: ADDRESS_PATTERN }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'string', pattern: '^\\d+$' },
            offset: { type: 'string', pattern: '^\\d+$' }
          },
          additionalProperties: false
        },
        response: {
          200: {
            type: 'object',
            required: ['ok', 'data'],
            properties: {
              ok: { type: 'boolean' },
              data: {
                type: 'object',
                required: ['address', 'limit', 'offset', 'total', 'items'],
                properties: {
                  address: { type: 'string' },
                  limit: { type: 'number' },
                  offset: { type: 'number' },
                  total: { type: 'number' },
                  items: {
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
      let normalizedAddress: string;
      try {
        normalizedAddress = getAddress(request.params.address);
      } catch {
        return reply.code(400).send({
          ok: false,
          message: 'Invalid address format.'
        });
      }

      let limit: number;
      let offset: number;
      try {
        limit = parsePositiveInteger(request.query.limit, DEFAULT_LIMIT);
        offset = parsePositiveInteger(request.query.offset, 0);
      } catch {
        return reply.code(400).send({
          ok: false,
          message: 'Invalid limit or offset.'
        });
      }

      if (limit === 0 || limit > MAX_LIMIT) {
        return reply.code(400).send({
          ok: false,
          message: `limit must be between 1 and ${MAX_LIMIT}.`
        });
      }

      const result = await listAddressTransfers(normalizedAddress, { limit, offset });
      if (result.total === 0) {
        return reply.code(404).send({
          ok: false,
          message: 'No transfers found for this address.'
        });
      }

      return reply.send({
        ok: true,
        data: result
      });
    }
  );
}
