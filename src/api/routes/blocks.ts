import type { FastifyInstance } from 'fastify';
import { getBlockDetails } from '../../services/blockService.js';

type BlockParams = {
  number: string;
};

function parseBlockNumber(raw: string): bigint | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

export async function blockRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: BlockParams }>(
    '/blocks/:number',
    {
      schema: {
        params: {
          type: 'object',
          required: ['number'],
          properties: {
            number: { type: 'string', pattern: '^\\d+$' }
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
                required: ['block', 'transferCount'],
                properties: {
                  block: {
                    type: 'object',
                    required: ['number', 'hash', 'parentHash', 'timestamp', 'txCount'],
                    properties: {
                      number: { type: 'string' },
                      hash: { type: 'string' },
                      parentHash: { type: 'string' },
                      timestamp: { type: 'string' },
                      txCount: { type: 'number' }
                    }
                  },
                  transferCount: { type: 'number' }
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
      const blockNumber = parseBlockNumber(request.params.number);
      if (blockNumber == null) {
        return reply.code(400).send({
          ok: false,
          message: 'Invalid block number.'
        });
      }

      const result = await getBlockDetails(blockNumber);
      if (!result) {
        return reply.code(404).send({
          ok: false,
          message: 'Block not found.'
        });
      }

      return reply.send({
        ok: true,
        data: result
      });
    }
  );
}
