import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import {
  type AvailabilityResult,
  checkAvailability,
  validateTimes,
} from "@/domain/availability";
import { filterRooms, parseAttendees } from "@/domain/roomFilter";
import { fromHHMM } from "@/domain/time";
import { ROOMS, type Equipment } from "@/data/rooms";
import { AppHeader } from "@/components/AppHeader";
import { BookingsPanel } from "@/components/BookingsPanel";
import { CheckActions } from "@/components/CheckActions";
import { ResultCard } from "@/components/ResultCard";
import { RoomFilters } from "@/components/RoomFilters";
import { RoomList } from "@/components/RoomList";
import { RulesPanel } from "@/components/RulesPanel";
import { TimeField } from "@/components/TimeField";
import { TimeReadout } from "@/components/TimeReadout";
import { ValidationWarnings } from "@/components/ValidationWarnings";

const DEFAULTS = {
  roomId: ROOMS[0].id,
  attendees: "1",
  now: "08:30",
  start: "10:30",
  end: "11:30",
};

const NO_ROOM_RESULT: AvailabilityResult = {
  ok: false,
  reason: "No room selected",
  detail: "Choose a room from the list first.",
};

const clockIcon = <Clock className="h-4 w-4" />;

function matchingRooms(attendeesStr: string, equipment: readonly Equipment[]) {
  const attendees = parseAttendees(attendeesStr);
  return attendees === null ? [] : filterRooms(ROOMS, { attendees, equipment });
}

function App() {
  const [roomId, setRoomId] = useState<string | null>(DEFAULTS.roomId);
  const [attendeesStr, setAttendeesStr] = useState<string>(DEFAULTS.attendees);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [nowStr, setNowStr] = useState<string>(DEFAULTS.now);
  const [startStr, setStartStr] = useState<string>(DEFAULTS.start);
  const [endStr, setEndStr] = useState<string>(DEFAULTS.end);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const attendeesValid = parseAttendees(attendeesStr) !== null;
  const rooms = useMemo(() => matchingRooms(attendeesStr, equipment), [attendeesStr, equipment]);
  // The selected room is always one of the matching rooms (F5).
  const selectedRoom = rooms.find((r) => r.id === roomId) ?? null;

  const now = fromHHMM(nowStr);
  const start = fromHHMM(startStr);
  const end = fromHHMM(endStr);

  // Live warnings come from the same validation the Check button uses.
  const validation = validateTimes({ now, start, end });
  const fieldIssues = validation.ok ? [] : validation.issues.map((issue) => issue.message);

  function handleCheck() {
    if (!selectedRoom) {
      setResult(NO_ROOM_RESULT);
      return;
    }
    // Uses only the selected room's own bookings and blocked flag (F3, F5).
    setResult(checkAvailability({ now, start, end }, selectedRoom.bookings, selectedRoom.blocked));
  }

  // Any edit to a time field invalidates the previous result (no stale answers).
  function editTime(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setResult(null);
    };
  }

  // After a filter change, drop the selection (and its result) if the selected
  // room no longer matches.
  function applyFilters(nextAttendees: string, nextEquipment: Equipment[]) {
    setAttendeesStr(nextAttendees);
    setEquipment(nextEquipment);
    const stillListed = matchingRooms(nextAttendees, nextEquipment).some((r) => r.id === roomId);
    if (!stillListed) {
      setRoomId(null);
      setResult(null);
    }
  }

  function handleEquipmentToggle(item: Equipment) {
    const next = equipment.includes(item)
      ? equipment.filter((e) => e !== item)
      : [...equipment, item];
    applyFilters(attendeesStr, next);
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setResult(null);
  }

  function handleReset() {
    setRoomId(DEFAULTS.roomId);
    setAttendeesStr(DEFAULTS.attendees);
    setEquipment([]);
    setNowStr(DEFAULTS.now);
    setStartStr(DEFAULTS.start);
    setEndStr(DEFAULTS.end);
    setResult(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <AppHeader />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <RoomFilters
            attendees={attendeesStr}
            attendeesValid={attendeesValid}
            equipment={equipment}
            onAttendeesChange={(value) => applyFilters(value, equipment)}
            onEquipmentToggle={handleEquipmentToggle}
          />
          <RoomList
            rooms={rooms}
            selectedId={selectedRoom?.id ?? null}
            attendeesValid={attendeesValid}
            onSelect={handleRoomChange}
            onClearFilters={() => applyFilters(DEFAULTS.attendees, [])}
          />

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <TimeField label="Now" hint="current time" value={nowStr} onChange={editTime(setNowStr)} icon={clockIcon} />
            <TimeField label="Start" hint="booking begin" value={startStr} onChange={editTime(setStartStr)} icon={clockIcon} />
            <TimeField label="End" hint="booking end" value={endStr} onChange={editTime(setEndStr)} icon={clockIcon} />
          </div>

          <TimeReadout now={now} start={start} end={end} />
          <ValidationWarnings issues={fieldIssues} />
          <CheckActions onCheck={handleCheck} onReset={handleReset} />
          <ResultCard result={result} />
        </section>

        <BookingsPanel room={selectedRoom} start={start} end={end} />
        <RulesPanel />

        <footer className="mt-6 text-center text-xs text-slate-400">
          Prototype · fictional data · no login, backend, or external services.
        </footer>
      </div>
    </div>
  );
}

export default App;
