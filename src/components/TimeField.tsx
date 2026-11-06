import { useId, type ReactNode } from "react";

type TimeFieldProps = {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  icon: ReactNode;
};

export function TimeField({ label, hint, value, onChange, icon }: TimeFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        aria-describedby={hintId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />
      <p id={hintId} className="mt-1 text-[11px] text-slate-400">{hint}</p>
    </div>
  );
}
