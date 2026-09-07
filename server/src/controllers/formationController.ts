import { FastifyInstance } from 'fastify';
import { container } from '../di/container.js';
import { FormationRepository } from '../interfaces/repositories/FormationRepository.js';
import { FormationRecord } from '../models/Formation.js';

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
    try {
      const created = await repo.create(request.body as Partial<FormationRecord>);
      return reply.status(201).send(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid formation';
      return reply.status(400).send({ error: message });
    }
  });

  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const updated = await repo.update(id, request.body as Partial<FormationRecord>);
      if (!updated) return reply.status(404).send({ error: 'Formation not found' });
      return updated;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid formation';
      return reply.status(400).send({ error: message });
    }
  });

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const deleted = await repo.delete(id);
    return { success: deleted };
  });
}
