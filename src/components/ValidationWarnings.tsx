import { Info } from "lucide-react";

type ValidationWarningsProps = {
  issues: readonly string[];
};

export function ValidationWarnings({ issues }: ValidationWarningsProps) {
  if (issues.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
      <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-amber-800">
        <Info className="h-4 w-4" /> Please fix these before checking
      </p>
      <ul className="list-disc space-y-0.5 pl-5 text-xs text-amber-700">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
    </div>
  );
}
