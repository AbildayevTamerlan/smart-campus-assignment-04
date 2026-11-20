import { MAX_BOOKING_MINUTES, MINUTES_PER_DAY } from "@/domain/time";

// Static reference of the booking rules shown at the bottom of the page.
// The numeric limits come from the domain constants.
export function RulesPanel() {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 sm:p-5">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Rules used</h2>
      <ul className="space-y-1">
        <li>• Times are integer minutes after midnight (0 ≤ start &lt; end ≤ {MINUTES_PER_DAY}).</li>
        <li>• Start must be strictly after "now".</li>
        <li>• Duration ≤ {MAX_BOOKING_MINUTES} minutes (exactly {MAX_BOOKING_MINUTES} is allowed).</li>
        <li>• Only rooms with capacity ≥ attendees and ALL selected equipment are listed.</li>
        <li>• Blocked rooms stay visible but are always rejected.</li>
        <li>• Touching endpoints (e.g. 10:00–11:00 and 11:00–12:00) do not overlap.</li>
        <li>• Existing bookings are never modified — this is a read-only check.</li>
      </ul>
    </section>
  );
}
