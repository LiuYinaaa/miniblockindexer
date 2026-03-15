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
