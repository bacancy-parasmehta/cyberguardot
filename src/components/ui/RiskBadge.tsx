import type { RiskLevel } from "@/types";
import { cn } from "@/lib/utils";

const riskClasses: Record<RiskLevel, string> = {
  critical: "bg-red-500/15 text-red-300",
  high: "bg-amber-500/15 text-amber-300",
  medium: "bg-yellow-500/15 text-yellow-300",
  low: "bg-green-500/15 text-green-300",
  informational: "bg-slate-700 text-slate-200",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
        riskClasses[level],
      )}
    >
      {level.replaceAll("_", " ")}
    </span>
  );
}

