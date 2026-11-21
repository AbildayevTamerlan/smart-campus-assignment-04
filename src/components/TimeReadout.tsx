import { Info } from "lucide-react";
import { type DurationStatus, durationStatus } from "@/domain/availability";
import { MINUTES_PER_DAY } from "@/domain/time";

type TimeReadoutProps = {
  now: number | null;
  start: number | null;
  end: number | null;
};

// Chip colour per duration status (the status itself comes from the domain).
const DURATION_CHIP_CLASS: Record<DurationStatus, string> = {
  tooLong: "bg-red-50 text-red-700",
  notPositive: "bg-amber-50 text-amber-700",
  ok: "bg-emerald-50 text-emerald-700",
};

// Chips under the time inputs: raw minute values and the live duration.
export function TimeReadout({ now, start, end }: TimeReadoutProps) {
  const duration = start !== null && end !== null ? end - start : null;
  const status = start !== null && end !== null ? durationStatus(start, end) : null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
        <Info className="h-3.5 w-3.5" />
        Times are minutes after midnight (0–{MINUTES_PER_DAY}).
      </span>
      {now !== null && (
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono">now={now}</span>
      )}
      {start !== null && (
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono">start={start}</span>
      )}
      {end !== null && (
        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono">end={end}</span>
      )}
      {duration !== null && status !== null && (
        <span className={`rounded-md px-2 py-1 font-mono ${DURATION_CHIP_CLASS[status]}`}>
          duration={duration} min
        </span>
      )}
    </div>
  );
}
