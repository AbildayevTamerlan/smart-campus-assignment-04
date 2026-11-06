import { DoorClosed } from "lucide-react";
import type { Booking } from "@/domain/availability";
import { BookingList } from "@/components/BookingList";
import { BookingTimeline } from "@/components/BookingTimeline";

type BookingsPanelProps = {
  bookings: readonly Booking[];
  start: number | null;
  end: number | null;
};

export function BookingsPanel({ bookings, start, end }: BookingsPanelProps) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <DoorClosed className="h-4 w-4 text-slate-500" />
        <h2 className="text-sm font-semibold text-slate-700">Existing bookings today</h2>
        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>
      <BookingTimeline bookings={bookings} start={start} end={end} />
      <BookingList bookings={bookings} />
    </section>
  );
}
