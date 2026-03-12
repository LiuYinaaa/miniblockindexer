import Fastify, { type FastifyInstance } from 'fastify';

import { blockRoutes } from './routes/blocks.js';
import { healthRoutes } from './routes/health.js';
import { transactionRoutes } from './routes/transactions.js';
import { transferRoutes } from './routes/transfers.js';

export function buildServer(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(healthRoutes);
  app.register(blockRoutes);
  app.register(transactionRoutes);
  app.register(transferRoutes);

  return app;
}
