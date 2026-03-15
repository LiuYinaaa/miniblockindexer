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
  app.get<{ Params: BlockParams }>('/blocks/:number', async (request, reply) => {
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
  });
}
