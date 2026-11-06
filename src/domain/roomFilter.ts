// Room filtering: "does this room fit my needs?" (F1, F2).
// Deliberately separate from the booking rules in availability.ts, which answer
// "is this room free at this time?". Pure functions; never modify the rooms.
import type { Equipment, Room } from "@/data/rooms";

export type RoomCriteria = {
  attendees: number;
  equipment: readonly Equipment[];
};

// Only the room fields the filter needs.
type FilterableRoom = Pick<Room, "capacity" | "equipment">;

// Parse the attendees field: a whole number >= 1, otherwise null.
export function parseAttendees(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) return null;
  const n = parseInt(value, 10);
  return n >= 1 ? n : null;
}

// F1: capacity must be at least the number of attendees.
export function hasCapacity(room: FilterableRoom, attendees: number): boolean {
  return room.capacity >= attendees;
}

// F2: the room must have ALL selected equipment (no selection = any room).
export function hasAllEquipment(room: FilterableRoom, required: readonly Equipment[]): boolean {
  return required.every((item) => room.equipment.includes(item));
}

export function matchesCriteria(room: FilterableRoom, criteria: RoomCriteria): boolean {
  return hasCapacity(room, criteria.attendees) && hasAllEquipment(room, criteria.equipment);
}

// Blocked rooms are NOT filtered out here: they stay visible and the booking
// rules (checkAvailability) always report them as Unavailable (F3).
export function filterRooms<R extends FilterableRoom>(rooms: readonly R[], criteria: RoomCriteria): R[] {
  return rooms.filter((room) => matchesCriteria(room, criteria));
}
