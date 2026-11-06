import { describe, it, expect } from 'vitest';
import {
  filterRooms,
  hasAllEquipment,
  hasCapacity,
  matchesCriteria,
  parseAttendees,
} from '@/domain/roomFilter';
import { ROOMS, type Room } from '@/data/rooms';

const room = (over: Partial<Room>): Room => ({
  id: 'r',
  name: 'Test Room',
  capacity: 10,
  equipment: ['Projector', 'Whiteboard'],
  blocked: false,
  bookings: [],
  ...over,
});

const ids = (rooms: readonly Room[]) => rooms.map((r) => r.id);

describe('F1 – capacity >= attendees', () => {
  it('accepts capacity exactly equal to attendees', () => {
    expect(hasCapacity(room({ capacity: 10 }), 10)).toBe(true);
  });

  it('rejects capacity one less than attendees', () => {
    expect(hasCapacity(room({ capacity: 9 }), 10)).toBe(false);
  });

  it('on the catalog: 6 attendees keeps Library 201 (capacity 6), 7 drops it', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 6, equipment: [] }))).toContain('lib-201');
    expect(ids(filterRooms(ROOMS, { attendees: 7, equipment: [] }))).not.toContain('lib-201');
  });
});

describe('F2 – room must have ALL selected equipment', () => {
  it('accepts a room that has all selected equipment', () => {
    expect(hasAllEquipment(room({}), ['Projector', 'Whiteboard'])).toBe(true);
  });

  it('accepts a room that has more than the selected equipment', () => {
    expect(hasAllEquipment(room({}), ['Projector'])).toBe(true);
  });

  it('rejects a room that has some but not all of the selected equipment', () => {
    expect(hasAllEquipment(room({}), ['Projector', 'Computers'])).toBe(false);
  });

  it('no equipment selected accepts any room, including one with no equipment', () => {
    expect(hasAllEquipment(room({ equipment: [] }), [])).toBe(true);
  });

  it('on the catalog: Projector + Video conferencing -> bus-305 and med-014 only', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ['Projector', 'Video conferencing'] }))).toEqual([
      'bus-305',
      'med-014',
    ]);
  });
});

describe('filterRooms', () => {
  it('no filters (1 attendee, no equipment) returns every room in catalog order', () => {
    expect(filterRooms(ROOMS, { attendees: 1, equipment: [] })).toEqual(ROOMS);
  });

  it('F1 and F2 combine: both must hold', () => {
    const r = room({ capacity: 10, equipment: ['Projector'] });
    expect(matchesCriteria(r, { attendees: 10, equipment: ['Projector'] })).toBe(true);
    expect(matchesCriteria(r, { attendees: 11, equipment: ['Projector'] })).toBe(false);
    expect(matchesCriteria(r, { attendees: 10, equipment: ['Whiteboard'] })).toBe(false);
  });

  it('returns an empty list when nothing matches (F4 data)', () => {
    expect(filterRooms(ROOMS, { attendees: 1000, equipment: [] })).toEqual([]);
  });

  it('keeps blocked rooms in the result (F3 is decided by the booking rules)', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: [] }))).toContain('med-014');
  });

  it('does not modify the room list', () => {
    const before = structuredClone(ROOMS);
    filterRooms(ROOMS, { attendees: 20, equipment: ['Projector'] });
    expect(ROOMS).toEqual(before);
  });
});

describe('parseAttendees', () => {
  it.each([
    ['1', 1],
    ['12', 12],
    [' 5 ', 5],
  ])('parses %j as %d', (input, expected) => {
    expect(parseAttendees(input)).toBe(expected);
  });

  it.each(['', '0', '-1', '2.5', 'abc', '1e2'])('rejects %j', (input) => {
    expect(parseAttendees(input)).toBeNull();
  });
});

describe('catalog sanity', () => {
  it('has at least 4 rooms, unique ids, and exactly one blocked room', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids(ROOMS)).size).toBe(ROOMS.length);
    expect(ROOMS.filter((r) => r.blocked)).toHaveLength(1);
  });

  it('every booking is a valid interval inside the day', () => {
    for (const r of ROOMS) {
      for (const b of r.bookings) {
        expect(0 <= b.start && b.start < b.end && b.end <= 1440).toBe(true);
      }
    }
  });
});
