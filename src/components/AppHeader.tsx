import { CalendarClock } from "lucide-react";

export function AppHeader() {
  return (
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
  );
}
