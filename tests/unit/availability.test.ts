import { describe, it, expect } from 'vitest';
import {
  type Booking,
  checkAvailability,
  overlap,
  validateTimes,
} from '@/domain/availability';

// One existing booking 10:00–11:00 (600–660).
const BOOKINGS: readonly Booking[] = Object.freeze([
  Object.freeze({ id: 'x1', title: 'Existing Meeting', start: 600, end: 660 }),
]);

const check = (now: number, start: number, end: number, blocked = false) =>
  checkAvailability({ now, start, end }, BOOKINGS, blocked);

describe('checkAvailability – AC2 duration', () => {
  it('accepts exactly 120 minutes', () => {
    const r = check(0, 780, 900);
    expect(r.ok).toBe(true);
    expect(r.detail).toContain('120 min');
  });

  it('rejects 121 minutes', () => {
    const r = check(0, 780, 901);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Booking too long');
    expect(r.detail).toContain('121');
  });
});

describe('checkAvailability – AC4 touching vs overlapping', () => {
  it('accepts a slot that ends exactly when the booking starts (540–600)', () => {
    expect(check(0, 540, 600).ok).toBe(true);
  });

  it('accepts a slot that starts exactly when the booking ends (660–720)', () => {
    expect(check(0, 660, 720).ok).toBe(true);
  });

  it('rejects a partial overlap at the start (570–630) and names the booking', () => {
    const r = check(0, 570, 630);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Overlaps an existing booking');
    expect(r.detail).toContain('Existing Meeting');
  });

  it('rejects a partial overlap at the end (630–690)', () => {
    expect(check(0, 630, 690).ok).toBe(false);
  });

  it('rejects a slot inside the booking (615–645)', () => {
    expect(check(0, 615, 645).ok).toBe(false);
  });

  it('rejects a slot that contains the booking (590–670)', () => {
    expect(check(0, 590, 670).ok).toBe(false);
  });

  it('rejects the identical slot (600–660)', () => {
    expect(check(0, 600, 660).ok).toBe(false);
  });

  it('overlap() treats touching endpoints as no overlap, in both orders', () => {
    expect(overlap(600, 660, 660, 720)).toBe(false);
    expect(overlap(660, 720, 600, 660)).toBe(false);
    expect(overlap(600, 661, 660, 720)).toBe(true);
  });
});

describe('checkAvailability – AC1 start strictly after now', () => {
  it('rejects start == now', () => {
    const r = check(780, 780, 840);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Start is not in the future');
  });

  it('rejects start before now', () => {
    expect(check(800, 780, 840).ok).toBe(false);
  });

  it('accepts start == now + 1', () => {
    expect(check(779, 780, 840).ok).toBe(true);
  });

  it('rejects start == end and start > end', () => {
    expect(check(0, 780, 780).reason).toBe('Invalid time window');
    expect(check(0, 840, 780).reason).toBe('Invalid time window');
  });

  it('accepts end == 1440 at the domain level (the UI time input cannot enter 24:00)', () => {
    expect(check(0, 1380, 1440).ok).toBe(true);
  });

  it('rejects end > 1440 and start < 0', () => {
    expect(check(0, 1380, 1441).reason).toBe('Invalid time window');
    expect(checkAvailability({ now: -10, start: -1, end: 60 }, [], false).reason).toBe('Invalid time window');
  });

  it('rejects unparseable input (null fields)', () => {
    const r = checkAvailability({ now: null, start: 780, end: 840 }, BOOKINGS, false);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Invalid time input');
  });
});

describe('checkAvailability – AC3 / F3 blocked', () => {
  it('rejects a valid, free slot when blocked', () => {
    const r = check(0, 780, 840, true);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('Room is blocked');
  });

  it('rejects when blocked even with no bookings at all', () => {
    expect(checkAvailability({ now: 0, start: 780, end: 840 }, [], true).ok).toBe(false);
  });

  it('still rejects invalid times on a blocked room (never Available)', () => {
    expect(check(0, 780, 1000, true).ok).toBe(false);
    expect(check(800, 780, 840, true).ok).toBe(false);
  });

  it('the same slot is available when not blocked', () => {
    expect(check(0, 780, 840, false).ok).toBe(true);
  });
});

describe('checkAvailability – AC5 read-only', () => {
  it('does not modify the bookings (frozen input, deep-equal afterwards)', () => {
    const copy = structuredClone(BOOKINGS);
    check(0, 630, 690);
    check(0, 780, 840);
    expect(BOOKINGS).toEqual(copy);
  });
});

describe('validateTimes – one source for warnings and result', () => {
  it('lists every issue in priority order', () => {
    const v = validateTimes({ now: 800, start: 780, end: 1000 });
    expect(v.ok).toBe(false);
    if (!v.ok) {
      expect(v.issues.map((i) => i.reason)).toEqual(['Start is not in the future', 'Booking too long']);
    }
  });

  it('reports each missing field separately', () => {
    const v = validateTimes({ now: null, start: null, end: null });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.issues).toHaveLength(3);
  });

  it('returns the parsed times when valid', () => {
    expect(validateTimes({ now: 0, start: 60, end: 120 })).toEqual({
      ok: true,
      times: { now: 0, start: 60, end: 120 },
    });
  });
});
