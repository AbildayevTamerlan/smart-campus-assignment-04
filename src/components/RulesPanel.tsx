// Static reference of the booking rules shown at the bottom of the page.
export function RulesPanel() {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 sm:p-5">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Rules used</h2>
      <ul className="space-y-1">
        <li>• Times are integer minutes after midnight (0 ≤ start &lt; end ≤ 1440).</li>
        <li>• Start must be strictly after "now".</li>
        <li>• Duration ≤ 120 minutes (exactly 120 is allowed).</li>
        <li>• Blocked rooms are always rejected.</li>
        <li>• Touching endpoints (e.g. 10:00–11:00 and 11:00–12:00) do not overlap.</li>
        <li>• Existing bookings are never modified — this is a read-only check.</li>
      </ul>
    </section>
  );
}
