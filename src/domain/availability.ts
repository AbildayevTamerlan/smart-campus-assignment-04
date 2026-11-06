// Booking rules: "is this room free at this time?" (AC1–AC5).
// Pure functions — no React, no state. Never modifies the bookings passed in.
import { MAX_BOOKING_MINUTES, MINUTES_PER_DAY, toHHMM } from "@/domain/time";

export type Booking = {
  id: string;
  title: string;
  start: number; // minutes after midnight
  end: number; // minutes after midnight
};

export type AvailabilityResult = {
  ok: boolean;
  reason: string;
  detail?: string;
};

// Parsed form input; null means the field could not be parsed.
export type TimeInput = {
  now: number | null;
  start: number | null;
  end: number | null;
};

export function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Touching endpoints do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  { now, start, end }: TimeInput,
  bookings: readonly Booking[],
  blocked: boolean,
): AvailabilityResult {
  if (now === null || start === null || end === null) {
    return { ok: false, reason: "Invalid time input", detail: "Use HH:MM format for all fields." };
  }
  if (now < 0 || now > MINUTES_PER_DAY - 1) {
    return { ok: false, reason: "'Now' is out of range", detail: "Now must be 00:00–23:59." };
  }
  if (!(0 <= start && start < end && end <= MINUTES_PER_DAY)) {
    return {
      ok: false,
      reason: "Invalid time window",
      detail: "Need 0 ≤ start < end ≤ 1440 (24:00).",
    };
  }
  if (!(start > now)) {
    return {
      ok: false,
      reason: "Start is not in the future",
      detail: `Start (${toHHMM(start)}) must be strictly after now (${toHHMM(now)}).`,
    };
  }
  const dur = end - start;
  if (dur > MAX_BOOKING_MINUTES) {
    return {
      ok: false,
      reason: "Booking too long",
      detail: `Duration is ${dur} min. Maximum allowed is ${MAX_BOOKING_MINUTES} min.`,
    };
  }
  if (blocked) {
    return {
      ok: false,
      reason: "Room is blocked",
      detail: "This room is currently blocked and cannot be booked.",
    };
  }
  const conflict = bookings.find((b) => overlap(start, end, b.start, b.end));
  if (conflict) {
    return {
      ok: false,
      reason: "Overlaps an existing booking",
      detail: `Conflicts with "${conflict.title}" (${toHHMM(conflict.start)}–${toHHMM(conflict.end)}).`,
    };
  }
  return {
    ok: true,
    reason: "Available",
    detail: `${toHHMM(start)}–${toHHMM(end)} (${dur} min) is free on this room.`,
  };
}
