import type { Booking } from "@/domain/availability";
import { MINUTES_PER_DAY, toHHMM } from "@/domain/time";

type BookingTimelineProps = {
  bookings: readonly Booking[];
  start: number | null;
  end: number | null;
};

// 24-hour timeline ticks (every 2 hours).
const TICKS = Array.from({ length: 13 }, (_, i) => i * 120);

const pct = (minutes: number) => `${(minutes / MINUTES_PER_DAY) * 100}%`;

export function BookingTimeline({ bookings, start, end }: BookingTimelineProps) {
  return (
    <div className="mb-4">
      <div className="relative h-10 w-full overflow-hidden rounded-lg bg-slate-100">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded bg-blue-500/80 px-1 text-[10px] leading-7 text-white overflow-hidden whitespace-nowrap"
            style={{ left: pct(b.start), width: pct(b.end - b.start) }}
            title={`${b.title} ${toHHMM(b.start)}–${toHHMM(b.end)}`}
          >
            <span className="truncate">{b.title}</span>
          </div>
        ))}
        {/* Proposed slot overlay */}
        {start !== null && end !== null && start < end && end <= MINUTES_PER_DAY && (
          <div
            className="absolute top-1 bottom-1 rounded border-2 border-dashed border-blue-700 bg-blue-300/40"
            style={{ left: pct(start), width: pct(end - start) }}
            title="Your proposed booking"
          />
        )}
        {/* Tick marks */}
        {TICKS.map((t) => (
          <div
            key={t}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: pct(t) }}
          />
        ))}
      </div>
      <div className="relative mt-1 h-4 w-full text-[10px] text-slate-400">
        {TICKS.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t) }}>
            {toHHMM(t)}
          </span>
        ))}
      </div>
    </div>
  );
}
