# Tactics Lab FC

Football tactics board: drag-and-drop formations, real club squads from API-Football, per-slot roles, a substitutes bench, and save/load to MongoDB.

- **Client:** React 19, Vite, TypeScript, Tailwind CSS
- **Server:** Fastify, MongoDB (Mongoose), TypeScript, Inversify
- **Player data:** [API-Football](https://api-football.com) via RapidAPI
- **Persistence:** MongoDB (`mongodb://localhost:27017/tactics-lab-fc` by default) for saved formations only

## Setup

### 1. API-Football key

Sign up at [rapidapi.com/api-sports/api/api-football](https://rapidapi.com/api-sports/api/api-football) (free tier: 100 requests/day).

Create a `server/.env` file:

```
RAPIDAPI_KEY=your_key_here
MONGO_URI=mongodb://localhost:27017/tactics-lab-fc   # optional
```

### 2. Install & run

```bash
pnpm install        # install all workspace dependencies
pnpm dev            # run client (port 5173) + server (port 3000) concurrently
```

## Common Commands

```bash
pnpm dev                 # Run both client and server concurrently
pnpm dev:client          # Run client only (port 5173)
pnpm dev:server          # Run server only (port 3000)
pnpm test                # Run server tests
pnpm test:client         # Run client tests
pnpm build               # Build client for production
```

## Architecture

```
server/src/
├── controllers/
│   ├── formationController.ts   # CRUD for saved formations
│   └── apiFootballController.ts # Proxy to API-Football (/api/search/teams, /api/search/squad)
├── repositories/    # Formation data access (Mongoose)
├── models/          # Formation Mongoose schema
├── interfaces/      # TypeScript contracts
├── di/              # Inversify container
└── index.ts         # Fastify entry point

client/src/
├── components/
│   └── FormationEditor.tsx  # Main tactics board (single view)
├── types/
│   └── roles.ts             # Position → role mapping
└── App.tsx
```

## Formation Editor Features

- **10 preset formations**: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2, 4-1-4-1, 4-3-2-1, 4-5-1, 3-6-1
- **Squad search**: Search any club by name via API-Football; loads the full registered squad
- **Player assignment**: Drag players from the squad panel onto pitch slots, or click-to-select then click a slot
- **Shirt numbers & names**: Each occupied node shows the player's surname, shirt number badge, and role
- **Role popover**: Click any slot to open a popover and assign a tactical role (e.g. Box-to-Box, Inside Forward, Sweeper-Keeper) — roles are position-specific
- **Substitutes bench**: Up to 9 bench players with drag-and-drop; drag bench players onto the pitch to swap
- **Drag to reposition**: All pitch nodes are freely draggable to fine-tune player positioning
- **Save / load / delete**: Formations (including all player assignments, roles, and subs) are persisted to MongoDB

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/teams?name=Barcelona` | Search teams by name via API-Football |
| GET | `/api/search/squad?teamId=529` | Load squad for a team ID |
| GET/POST | `/api/formations` | List/create saved formations |
| GET/PUT/DELETE | `/api/formations/:id` | Formation CRUD |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `RAPIDAPI_KEY` | — | **Required.** RapidAPI key for API-Football |
| `MONGO_URI` | `mongodb://localhost:27017/tactics-lab-fc` | MongoDB connection string |

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.
