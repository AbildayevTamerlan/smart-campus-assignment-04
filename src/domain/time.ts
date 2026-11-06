// Time helpers and limits shared by the booking rules and the UI.
// All times are integer minutes after midnight.

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;

// Convert minutes after midnight (0–1440) to "HH:MM".
// 1440 is the end of the day and is shown as "24:00" (not wrapped to "00:00").
export function toHHMM(min: number): string {
  if (min === MINUTES_PER_DAY) return "24:00";
  const m = ((min % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

// Convert an "HH:MM" string to minutes after midnight. Returns null if invalid.
export function fromHHMM(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}
