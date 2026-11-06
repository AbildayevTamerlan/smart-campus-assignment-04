import { CheckCircle2, XCircle } from "lucide-react";
import type { AvailabilityResult } from "@/domain/availability";

type ResultCardProps = {
  result: AvailabilityResult | null;
};

export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 rounded-xl border p-4 transition ${
        result.ok ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-start gap-3">
        {result.ok ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        )}
        <div className="min-w-0">
          <p className={`text-base font-semibold ${result.ok ? "text-emerald-800" : "text-red-800"}`}>
            {result.ok ? "Available" : "Unavailable"}
          </p>
          <p className={`text-sm ${result.ok ? "text-emerald-700" : "text-red-700"}`}>
            {result.reason}
          </p>
          {result.detail && (
            <p className={`mt-1 text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>
              {result.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
