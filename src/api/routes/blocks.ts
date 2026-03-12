import type { FastifyInstance } from 'fastify';

export async function blockRoutes(app: FastifyInstance): Promise<void> {
  app.get('/blocks', async (_request, reply) => {
    // TODO: query indexed block list from database.
    return reply.code(501).send({
      ok: false,
      message: 'Not implemented yet.'
    });
  });
}
