const KEY = 'tactics-lab-fc:formations';

export interface StoredFormation {
  _id: string;
  name: string;
  shape: string;
  positions: unknown[];
  substitutes: unknown[];
  teamName?: string;
}

function read(): StoredFormation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(items: StoredFormation[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listFormations(): StoredFormation[] {
  return read();
}

export function createFormation(body: Omit<StoredFormation, '_id'>): StoredFormation {
  const record: StoredFormation = {
    ...body,
    _id: crypto.randomUUID(),
  };
  write([record, ...read()]);
  return record;
}

export function updateFormation(id: string, body: Omit<StoredFormation, '_id'>): StoredFormation | null {
  const items = read();
  const idx = items.findIndex(f => f._id === id);
  if (idx < 0) return null;
  const record: StoredFormation = { ...body, _id: id };
  items[idx] = record;
  write(items);
  return record;
}

export function deleteFormation(id: string): boolean {
  const items = read();
  const next = items.filter(f => f._id !== id);
  if (next.length === items.length) return false;
  write(next);
  return true;
}
