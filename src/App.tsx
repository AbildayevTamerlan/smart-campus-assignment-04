import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Clock,
  DoorClosed,
  Info,
  Ban,
  RefreshCw,
} from "lucide-react";
import {
  type AvailabilityResult,
  type Booking,
  checkAvailability,
  validateTimes,
} from "@/domain/availability";
import { MAX_BOOKING_MINUTES, MINUTES_PER_DAY, fromHHMM, toHHMM } from "@/domain/time";

const ROOMS = [
  { id: "lib-201", name: "Library Study Room 201" },
  { id: "eng-110", name: "Engineering Lab 110" },
  { id: "bus-305", name: "Business Seminar Room 305" },
];

const INITIAL_BOOKINGS: Record<string, Booking[]> = {
  "lib-201": [
    { id: "b1", title: "Calc Study Group", start: 540, end: 600 }, // 9:00–10:00
    { id: "b2", title: "Project Standup", start: 720, end: 780 }, // 12:00–13:00
    { id: "b3", title: "Exam Review", start: 1020, end: 1080 }, // 17:00–18:00
  ],
  "eng-110": [
    { id: "b4", title: "Robotics Workshop", start: 480, end: 600 }, // 8:00–10:00
    { id: "b5", title: "Office Hours", start: 900, end: 960 }, // 15:00–16:00
  ],
  "bus-305": [
    { id: "b6", title: "Case Discussion", start: 630, end: 690 }, // 10:30–11:30
    { id: "b7", title: "Guest Lecture", start: 840, end: 960 }, // 14:00–16:00
    { id: "b8", title: "Networking Night", start: 1140, end: 1260 }, // 19:00–21:00
  ],
};

function App() {
  const [roomId, setRoomId] = useState<string>(ROOMS[0].id);
  const [nowStr, setNowStr] = useState<string>("08:30");
  const [startStr, setStartStr] = useState<string>("10:30");
  const [endStr, setEndStr] = useState<string>("11:30");
  const [blocked, setBlocked] = useState<boolean>(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const bookings = useMemo(() => INITIAL_BOOKINGS[roomId] ?? [], [roomId]);

  const now = fromHHMM(nowStr);
  const start = fromHHMM(startStr);
  const end = fromHHMM(endStr);

  // Duration readout for the chip below the inputs (display only).
  const duration = start !== null && end !== null ? end - start : null;

  // Live warnings come from the same validation the Check button uses.
  const validation = validateTimes({ now, start, end });
  const fieldIssues = validation.ok ? [] : validation.issues.map((issue) => issue.message);

  function handleCheck() {
    setResult(checkAvailability({ now, start, end }, bookings, blocked));
  }

  function handleReset() {
    setRoomId(ROOMS[0].id);
    setNowStr("08:30");
    setStartStr("10:30");
    setEndStr("11:30");
    setBlocked(false);
    setResult(null);
  }

  // 24-hour timeline ticks (every 2 hours).
  const ticks = Array.from({ length: 13 }, (_, i) => i * 120);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
              Smart Campus Room Availability
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Check whether a study room is free for your chosen time. Pure prototype — fictional data only.
            </p>
          </div>
        </header>

        {/* Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {/* Room selector */}
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="room">
            Room
          </label>
          <select
            id="room"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              setResult(null);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {ROOMS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Time inputs */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TimeField label="Now" hint="current time" value={nowStr} onChange={setNowStr} icon={<Clock className="h-4 w-4" />} />
            <TimeField label="Start" hint="booking begin" value={startStr} onChange={setStartStr} icon={<Clock className="h-4 w-4" />} />
            <TimeField label="End" hint="booking end" value={endStr} onChange={setEndStr} icon={<Clock className="h-4 w-4" />} />
          </div>

          {/* Duration + minute readout */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
              <Info className="h-3.5 w-3.5" />
              Times are minutes after midnight (0–1440).
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
            {duration !== null && (
              <span
                className={`rounded-md px-2 py-1 font-mono ${
                  duration > MAX_BOOKING_MINUTES
                    ? "bg-red-50 text-red-700"
                    : duration <= 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                duration={duration} min
              </span>
            )}
          </div>

          {/* Blocked toggle */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">Room is blocked</p>
                <p className="text-xs text-slate-500">If on, all bookings are rejected.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={blocked}
              onClick={() => {
                setBlocked((b) => !b);
                setResult(null);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-200 ${
                blocked ? "bg-red-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  blocked ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Validation feedback */}
          {fieldIssues.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-amber-800">
                <Info className="h-4 w-4" /> Please fix these before checking
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-700">
                {fieldIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleCheck}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.99]"
            >
              <CheckCircle2 className="h-4 w-4" />
              Check availability
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* Result */}
          {result && (
            <div
              role="status"
              aria-live="polite"
              className={`mt-4 rounded-xl border p-4 transition ${
                result.ok
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.ok ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                )}
                <div className="min-w-0">
                  <p
                    className={`text-base font-semibold ${
                      result.ok ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    {result.ok ? "Available" : "Unavailable"}
                  </p>
                  <p
                    className={`text-sm ${
                      result.ok ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {result.reason}
                  </p>
                  {result.detail && (
                    <p
                      className={`mt-1 text-xs ${
                        result.ok ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {result.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Existing bookings */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <DoorClosed className="h-4 w-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">
              Existing bookings today
            </h2>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          {/* Timeline visualization */}
          <div className="mb-4">
            <div className="relative h-10 w-full overflow-hidden rounded-lg bg-slate-100">
              {bookings.map((b) => {
                const leftPct = (b.start / MINUTES_PER_DAY) * 100;
                const widthPct = ((b.end - b.start) / MINUTES_PER_DAY) * 100;
                return (
                  <div
                    key={b.id}
                    className="absolute top-1 bottom-1 rounded bg-blue-500/80 px-1 text-[10px] leading-7 text-white overflow-hidden whitespace-nowrap"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${b.title} ${toHHMM(b.start)}–${toHHMM(b.end)}`}
                  >
                    <span className="truncate">{b.title}</span>
                  </div>
                );
              })}
              {/* Proposed slot overlay */}
              {start !== null && end !== null && start < end && end <= MINUTES_PER_DAY && (
                <div
                  className="absolute top-1 bottom-1 rounded border-2 border-dashed border-blue-700 bg-blue-300/40"
                  style={{
                    left: `${(start / MINUTES_PER_DAY) * 100}%`,
                    width: `${((end - start) / MINUTES_PER_DAY) * 100}%`,
                  }}
                  title="Your proposed booking"
                />
              )}
              {/* Tick marks */}
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute top-0 bottom-0 border-l border-slate-200"
                  style={{ left: `${(t / MINUTES_PER_DAY) * 100}%` }}
                />
              ))}
            </div>
            <div className="relative mt-1 h-4 w-full text-[10px] text-slate-400">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${(t / MINUTES_PER_DAY) * 100}%` }}
                >
                  {toHHMM(t)}
                </span>
              ))}
            </div>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No existing bookings for this room.</p>
          ) : (
            <ul className="space-y-2">
              {bookings
                .slice()
                .sort((a, b) => a.start - b.start)
                .map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {b.title}
                      </p>
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
          )}
        </section>

        {/* Acceptance criteria reference */}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 sm:p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Rules used</h2>
          <ul className="space-y-1">
            <li>• Times are integer minutes after midnight (0 ≤ start &lt; end ≤ 1440).</li>
            <li>• Start must be strictly after "now".</li>
            <li>• Duration ≤ 120 minutes (exactly 120 is allowed).</li>
            <li>• Blocked rooms are always rejected.</li>
            <li>• Touching endpoints (e.g. 10:00–11:00 and 11:00–12:00) do not overlap.</li>
            <li>• Existing bookings are never modified — this is a read-only check.</li>
          </ul>
        </section>

        <footer className="mt-6 text-center text-xs text-slate-400">
          Prototype · fictional data · no login, backend, or external services.
        </footer>
      </div>
    </div>
  );
}

type TimeFieldProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
};

function TimeField({ label, hint, value, onChange, icon }: TimeFieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}

export default App;
