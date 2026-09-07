import './env.js'; // must be first — loads .env before other modules read process.env
import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { formationRoutes } from './controllers/formationController.js';
import { apiFootballRoutes } from './controllers/apiFootballController.js';
import { connectDatabase } from './database.js';
import { bindFormationRepository } from './di/container.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: true });
  const mongoOk = await connectDatabase();
  bindFormationRepository(mongoOk);
  if (!process.env.RAPIDAPI_KEY) {
    app.log.warn('RAPIDAPI_KEY missing — team search returns Demo FC only');
  }
  await app.register(formationRoutes, { prefix: '/api/formations' });
  await app.register(apiFootballRoutes, { prefix: '/api/search' });
  await app.listen({ port: 3000, host: '127.0.0.1' });
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
