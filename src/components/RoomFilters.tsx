import { Users, Wrench } from "lucide-react";
import { EQUIPMENT, type Equipment } from "@/data/rooms";

type RoomFiltersProps = {
  attendees: string;
  attendeesValid: boolean;
  equipment: readonly Equipment[];
  onAttendeesChange: (value: string) => void;
  onEquipmentToggle: (item: Equipment) => void;
};

export function RoomFilters({
  attendees,
  attendeesValid,
  equipment,
  onAttendeesChange,
  onEquipmentToggle,
}: RoomFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
      <div>
        <label
          htmlFor="attendees"
          className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700"
        >
          <Users className="h-4 w-4 text-slate-400" />
          Attendees
        </label>
        <input
          id="attendees"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={attendees}
          onChange={(e) => onAttendeesChange(e.target.value)}
          aria-invalid={!attendeesValid}
          aria-describedby={attendeesValid ? undefined : "attendees-error"}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {!attendeesValid && (
          <p id="attendees-error" className="mt-1 text-[11px] text-amber-700">
            Enter a whole number, 1 or more.
          </p>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
          <Wrench className="h-4 w-4 text-slate-400" />
          Required equipment
        </legend>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((item) => {
            const checked = equipment.includes(item);
            return (
              <label
                key={item}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  checked
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onEquipmentToggle(item)}
                  className="h-3.5 w-3.5 accent-blue-600"
                />
                {item}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
