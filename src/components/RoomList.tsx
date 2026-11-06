import { Ban, SearchX, Users } from "lucide-react";
import type { Room } from "@/data/rooms";

type RoomListProps = {
  rooms: readonly Room[];
  selectedId: string | null;
  attendeesValid: boolean;
  onSelect: (roomId: string) => void;
  onClearFilters: () => void;
};

// Shows only the rooms that match the filters. Blocked rooms stay in the list
// with a "Blocked" badge (F3); F4 empty state when nothing matches.
export function RoomList({ rooms, selectedId, attendeesValid, onSelect, onClearFilters }: RoomListProps) {
  return (
    <fieldset className="mt-4">
      <legend className="mb-1.5 flex w-full items-center text-sm font-medium text-slate-700">
        Room
        <span className="ml-auto text-xs font-normal text-slate-500">
          {rooms.length} {rooms.length === 1 ? "match" : "matches"}
        </span>
      </legend>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <SearchX className="mx-auto mb-2 h-6 w-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">No rooms match your filters</p>
          <p className="mt-1 text-xs text-slate-500">
            {attendeesValid
              ? "Try fewer attendees or fewer required equipment items."
              : "Enter a valid number of attendees to see matching rooms."}
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => {
            const selected = room.id === selectedId;
            return (
              <label
                key={room.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="room"
                  value={room.id}
                  checked={selected}
                  onChange={() => onSelect(room.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{room.name}</span>
                    {room.blocked && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        <Ban className="h-3 w-3" />
                        Blocked
                      </span>
                    )}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Capacity {room.capacity}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{room.equipment.length > 0 ? room.equipment.join(", ") : "No equipment"}</span>
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
