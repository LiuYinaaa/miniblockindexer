import type { FastifyInstance } from 'fastify';

export async function transferRoutes(app: FastifyInstance): Promise<void> {
  app.get('/transfers', async (_request, reply) => {
    // TODO: query transfer list from database with pagination/filtering.
    return reply.code(501).send({
      ok: false,
      message: 'Not implemented yet.'
    });
  });
}
