import './env.js'; // must be first — loads .env before other modules read process.env
import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { formationRoutes } from './controllers/formationController.js';
import { apiFootballRoutes } from './controllers/apiFootballController.js';
import { connectDatabase } from './database.js';

const app = Fastify({ logger: true });

async function start() {
  await app.register(cors, { origin: true });
  await connectDatabase();
  await app.register(formationRoutes, { prefix: '/api/formations' });
  await app.register(apiFootballRoutes, { prefix: '/api/search' });
  await app.listen({ port: 3000 });
}

start().catch(console.error);
