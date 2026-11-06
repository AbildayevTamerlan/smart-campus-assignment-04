import { Ban } from "lucide-react";

type BlockedToggleProps = {
  blocked: boolean;
  onToggle: () => void;
};

export function BlockedToggle({ blocked, onToggle }: BlockedToggleProps) {
  return (
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
        onClick={onToggle}
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
  );
}
