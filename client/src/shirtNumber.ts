/** Shirt numbers are usually 1–99. 0, 100, and other 0–999 integers are allowed. Empty means none. */
export function parseShirtNumber(raw: string): number | undefined {
  const digits = raw.replace(/[^\d]/g, '').slice(0, 3);
  if (digits === '') return undefined;
  const n = Number(digits);
  if (!Number.isInteger(n) || n < 0 || n > 999) return undefined;
  return n;
}

export function shirtLabel(n: number | undefined): string {
  return n === undefined ? '—' : String(n);
}
