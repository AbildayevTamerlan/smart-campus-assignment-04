type RoomOption = { id: string; name: string };

type RoomPickerProps = {
  rooms: readonly RoomOption[];
  value: string;
  onChange: (roomId: string) => void;
};

export function RoomPicker({ rooms, value, onChange }: RoomPickerProps) {
  return (
    <>
      <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="room">
        Room
      </label>
      <select
        id="room"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </>
  );
}
