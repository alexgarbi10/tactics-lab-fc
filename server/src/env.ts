import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Loads server/.env before any other module reads process.env.
// This file must be the first import in index.ts.
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });
