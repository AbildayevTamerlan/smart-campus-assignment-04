import { describe, it, expect } from 'vitest';
import { fromHHMM, toHHMM } from '@/domain/time';

describe('toHHMM', () => {
  it.each([
    [0, '00:00'],
    [600, '10:00'],
    [1439, '23:59'],
    [1440, '24:00'],
  ])('%d -> %s', (min, text) => {
    expect(toHHMM(min)).toBe(text);
  });
});

describe('fromHHMM', () => {
  it('parses valid HH:MM', () => {
    expect(fromHHMM('00:00')).toBe(0);
    expect(fromHHMM('23:59')).toBe(1439);
  });

  it.each(['', '9:00', '24:00', '12:60', 'ab:cd'])('rejects %j', (value) => {
    expect(fromHHMM(value)).toBeNull();
  });
});
