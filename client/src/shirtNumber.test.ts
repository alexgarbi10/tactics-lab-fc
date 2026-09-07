import { describe, expect, it } from 'vitest';
import { parseShirtNumber, shirtLabel } from './shirtNumber';

describe('parseShirtNumber', () => {
  it('treats blank as no number', () => {
    expect(parseShirtNumber('')).toBeUndefined();
    expect(parseShirtNumber('   ')).toBeUndefined();
  });

  it('accepts the usual 1–99 range and 100', () => {
    expect(parseShirtNumber('1')).toBe(1);
    expect(parseShirtNumber('10')).toBe(10);
    expect(parseShirtNumber('99')).toBe(99);
    expect(parseShirtNumber('100')).toBe(100);
  });

  it('accepts 0 and other edge integers', () => {
    expect(parseShirtNumber('0')).toBe(0);
    expect(parseShirtNumber('00')).toBe(0);
    expect(parseShirtNumber('111')).toBe(111);
  });

  it('labels 0 instead of treating it as missing', () => {
    expect(shirtLabel(0)).toBe('0');
    expect(shirtLabel(undefined)).toBe('—');
  });
});
