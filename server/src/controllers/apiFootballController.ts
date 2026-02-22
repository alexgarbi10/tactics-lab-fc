import { FastifyInstance } from 'fastify';

const API_FOOTBALL_BASE = 'https://api-football-v1.p.rapidapi.com/v3';

async function apiFetch(path: string): Promise<Record<string, unknown>> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error('RAPIDAPI_KEY is not configured. Add it to server/.env');
  }

  const response = await fetch(`${API_FOOTBALL_BASE}${path}`, {
    headers: {
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
      'x-rapidapi-key': key,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football responded with ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

export async function apiFootballRoutes(fastify: FastifyInstance) {
  /**
   * GET /api/search/teams?name=Barcelona
   * Search real teams by name via API-Football.
   */
  fastify.get('/teams', async (request, reply) => {
    const { name } = request.query as { name?: string };

    if (!name?.trim()) {
      return reply.status(400).send({ error: 'Provide a "name" query parameter' });
    }

    try {
      const data = await apiFetch(`/teams?search=${encodeURIComponent(name)}`);
      const items = (data.response as Array<{
        team: { id: number; name: string; logo: string; country: string };
        venue: { city: string };
      }>) ?? [];

      return items.map(item => ({
        id: item.team.id,
        name: item.team.name,
        logo: item.team.logo,
        country: item.team.country,
        city: item.venue?.city ?? '',
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      fastify.log.error(`Team search failed: ${message}`);
      return reply.status(502).send({ error: message });
    }
  });

  /**
   * GET /api/search/squad?teamId=529
   * Load the registered squad for a team.
   */
  fastify.get('/squad', async (request, reply) => {
    const { teamId } = request.query as { teamId?: string };

    if (!teamId) {
      return reply.status(400).send({ error: 'Provide a "teamId" query parameter' });
    }

    try {
      const data = await apiFetch(`/players/squads?team=${teamId}`);
      const squads = data.response as Array<{
        team: { id: number; name: string };
        players: Array<{ id: number; name: string; number: number | null; pos: string; photo: string }>;
      }>;

      const squad = squads?.[0];
      if (!squad) return [];

      return squad.players.map(player => ({
        id: player.id,
        name: player.name,
        shirtNumber: player.number ?? undefined,
        position: player.pos ?? 'Unknown',
        photo: player.photo,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      fastify.log.error(`Squad load failed: ${message}`);
      return reply.status(502).send({ error: message });
    }
  });
}
