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

// One problem with the time input. `message` is the short live warning shown
// under the form; `reason` + `detail` are shown in the result after "Check".
export type TimeIssue = {
  message: string;
  reason: string;
  detail: string;
};

export type ValidTimes = { now: number; start: number; end: number };

export type TimeValidation =
  | { ok: true; times: ValidTimes }
  | { ok: false; issues: TimeIssue[] };

export function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Touching endpoints do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

// AC1 window: 0 ≤ start < end ≤ 1440. Shared by validateTimes and the timeline.
export function isValidWindow(start: number, end: number): boolean {
  return 0 <= start && start < end && end <= MINUTES_PER_DAY;
}

// AC2: longer than MAX_BOOKING_MINUTES (exactly the maximum is allowed).
export function exceedsMaxDuration(start: number, end: number): boolean {
  return end - start > MAX_BOOKING_MINUTES;
}

// Duration classification for display: too long (AC2), not positive (AC1
// start < end violated), or ok. Too long is checked first.
export type DurationStatus = "tooLong" | "notPositive" | "ok";

export function durationStatus(start: number, end: number): DurationStatus {
  if (exceedsMaxDuration(start, end)) return "tooLong";
  if (end - start <= 0) return "notPositive";
  return "ok";
}

// The single source of truth for AC1 (valid window, start strictly after now)
// and AC2 (max duration). Returns every issue, in priority order: the live
// warnings show all of them, the Check result shows the first one.
export function validateTimes({ now, start, end }: TimeInput): TimeValidation {
  const issues: TimeIssue[] = [];
  const invalidInput = (field: string): TimeIssue => ({
    message: `'${field}' must be a valid time (HH:MM).`,
    reason: "Invalid time input",
    detail: "Use HH:MM format for all fields.",
  });

  if (now === null) issues.push(invalidInput("Now"));
  if (start === null) issues.push(invalidInput("Start"));
  if (end === null) issues.push(invalidInput("End"));

  if (start !== null && end !== null && !isValidWindow(start, end)) {
    issues.push({
      message:
        start >= end
          ? "Start must be strictly before end."
          : `Times must be between ${toHHMM(0)} and ${toHHMM(MINUTES_PER_DAY)}.`,
      reason: "Invalid time window",
      detail: `Need 0 ≤ start < end ≤ ${MINUTES_PER_DAY} (${toHHMM(MINUTES_PER_DAY)}).`,
    });
  }

  if (start !== null && now !== null && !(start > now)) {
    issues.push({
      message: "Start must be strictly after 'now'.",
      reason: "Start is not in the future",
      detail: `Start (${toHHMM(start)}) must be strictly after now (${toHHMM(now)}).`,
    });
  }

  if (start !== null && end !== null && exceedsMaxDuration(start, end)) {
    issues.push({
      message: `Duration must not exceed ${MAX_BOOKING_MINUTES} minutes (2 hours).`,
      reason: "Booking too long",
      detail: `Duration is ${end - start} min. Maximum allowed is ${MAX_BOOKING_MINUTES} min.`,
    });
  }

  if (issues.length > 0 || now === null || start === null || end === null) {
    return { ok: false, issues };
  }
  return { ok: true, times: { now, start, end } };
}

export function checkAvailability(
  input: TimeInput,
  bookings: readonly Booking[],
  blocked: boolean,
): AvailabilityResult {
  const validation = validateTimes(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    return { ok: false, reason: first.reason, detail: first.detail };
  }
  const { start, end } = validation.times;
  const dur = end - start;
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
