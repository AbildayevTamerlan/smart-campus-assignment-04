import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import {
  type AvailabilityResult,
  type Booking,
  checkAvailability,
  validateTimes,
} from "@/domain/availability";
import { fromHHMM } from "@/domain/time";
import { AppHeader } from "@/components/AppHeader";
import { BlockedToggle } from "@/components/BlockedToggle";
import { BookingsPanel } from "@/components/BookingsPanel";
import { CheckActions } from "@/components/CheckActions";
import { ResultCard } from "@/components/ResultCard";
import { RoomPicker } from "@/components/RoomPicker";
import { RulesPanel } from "@/components/RulesPanel";
import { TimeField } from "@/components/TimeField";
import { TimeReadout } from "@/components/TimeReadout";
import { ValidationWarnings } from "@/components/ValidationWarnings";

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

const clockIcon = <Clock className="h-4 w-4" />;

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

  // Live warnings come from the same validation the Check button uses.
  const validation = validateTimes({ now, start, end });
  const fieldIssues = validation.ok ? [] : validation.issues.map((issue) => issue.message);

  function handleCheck() {
    setResult(checkAvailability({ now, start, end }, bookings, blocked));
  }

  // Any edit to a time field invalidates the previous result (no stale answers).
  function editTime(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setResult(null);
    };
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setResult(null);
  }

  function handleToggleBlocked() {
    setBlocked((b) => !b);
    setResult(null);
  }

  function handleReset() {
    setRoomId(ROOMS[0].id);
    setNowStr("08:30");
    setStartStr("10:30");
    setEndStr("11:30");
    setBlocked(false);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <AppHeader />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <RoomPicker rooms={ROOMS} value={roomId} onChange={handleRoomChange} />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TimeField label="Now" hint="current time" value={nowStr} onChange={editTime(setNowStr)} icon={clockIcon} />
            <TimeField label="Start" hint="booking begin" value={startStr} onChange={editTime(setStartStr)} icon={clockIcon} />
            <TimeField label="End" hint="booking end" value={endStr} onChange={editTime(setEndStr)} icon={clockIcon} />
          </div>

          <TimeReadout now={now} start={start} end={end} />
          <BlockedToggle blocked={blocked} onToggle={handleToggleBlocked} />
          <ValidationWarnings issues={fieldIssues} />
          <CheckActions onCheck={handleCheck} onReset={handleReset} />
          <ResultCard result={result} />
        </section>

        <BookingsPanel bookings={bookings} start={start} end={end} />
        <RulesPanel />

        <footer className="mt-6 text-center text-xs text-slate-400">
          Prototype · fictional data · no login, backend, or external services.
        </footer>
      </div>
    </div>
  );
}

export default App;
