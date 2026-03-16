import Fastify, { type FastifyInstance } from 'fastify';

import { blockRoutes } from './routes/blocks.js';
import { healthRoutes } from './routes/health.js';
import { transactionRoutes } from './routes/transactions.js';
import { transferRoutes } from './routes/transfers.js';

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.setErrorHandler((error, _request, reply) => {
    if ((error as { validation?: unknown }).validation) {
      return reply.code(400).send({
        ok: false,
        message: error.message
      });
    }

    if (typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({
        ok: false,
        message: error.message
      });
    }

    app.log.error(error);
    return reply.code(500).send({
      ok: false,
      message: 'Internal server error.'
    });
  });

  app.register(healthRoutes);
  app.register(blockRoutes);
  app.register(transactionRoutes);
  app.register(transferRoutes);

  return app;
}
