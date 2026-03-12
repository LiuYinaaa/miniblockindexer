import type { FastifyInstance } from 'fastify';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  app.get('/transactions', async (_request, reply) => {
    // TODO: query transaction list from database with pagination/filtering.
    return reply.code(501).send({
      ok: false,
      message: 'Not implemented yet.'
    });
  });
}
