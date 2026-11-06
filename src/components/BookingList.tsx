import type { Booking } from "@/domain/availability";
import { toHHMM } from "@/domain/time";

type BookingListProps = {
  bookings: readonly Booking[];
};

export function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-slate-500">No existing bookings for this room.</p>;
  }
  return (
    <ul className="space-y-2">
      {[...bookings]
        .sort((a, b) => a.start - b.start)
        .map((b) => (
          <li
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{b.title}</p>
              <p className="font-mono text-xs text-slate-500">
                {toHHMM(b.start)}–{toHHMM(b.end)} · {b.end - b.start} min
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {b.start}–{b.end}
            </span>
          </li>
        ))}
    </ul>
  );
}
