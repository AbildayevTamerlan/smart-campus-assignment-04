import { CheckCircle2, RefreshCw } from "lucide-react";

type CheckActionsProps = {
  onCheck: () => void;
  onReset: () => void;
};

export function CheckActions({ onCheck, onReset }: CheckActionsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        type="button"
        onClick={onCheck}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.99]"
      >
        <CheckCircle2 className="h-4 w-4" />
        Check availability
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <RefreshCw className="h-4 w-4" />
        Reset
      </button>
    </div>
  );
}
