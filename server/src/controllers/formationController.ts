import { FastifyInstance } from 'fastify';
import { container } from '../di/container.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';
import { Formation } from '../models/Formation.js';

export async function formationRoutes(fastify: FastifyInstance) {
  const repo = container.get<FormationRepository>('FormationRepository');

  fastify.get('/', async () => {
    return repo.findAll();
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const formation = await repo.findById(id);
    if (!formation) return reply.status(404).send({ error: 'Formation not found' });
    return formation;
  });

  fastify.post('/', async (request, reply) => {
    const created = await repo.create(request.body as Partial<Formation>);
    return reply.status(201).send(created);
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const updated = await repo.update(id, request.body as Partial<Formation>);
    if (!updated) return reply.status(404).send({ error: 'Formation not found' });
    return updated;
  });

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await repo.delete(id);
    return { success: deleted };
  });
}
