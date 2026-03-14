import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  online: "bg-green-500/15 text-green-300",
  offline: "bg-red-500/15 text-red-300",
  degraded: "bg-amber-500/15 text-amber-300",
  unknown: "bg-slate-700 text-slate-200",
  new: "bg-red-500/15 text-red-300",
  acknowledged: "bg-sky-500/15 text-sky-300",
  resolved: "bg-green-500/15 text-green-300",
  suppressed: "bg-slate-700 text-slate-200",
  open: "bg-red-500/15 text-red-300",
  investigating: "bg-amber-500/15 text-amber-300",
  contained: "bg-purple-500/15 text-purple-300",
  compliant: "bg-green-500/15 text-green-300",
  non_compliant: "bg-red-500/15 text-red-300",
  partial: "bg-amber-500/15 text-amber-300",
  not_applicable: "bg-slate-700 text-slate-200",
  in_progress: "bg-sky-500/15 text-sky-300",
  accepted_risk: "bg-yellow-500/15 text-yellow-300",
  false_positive: "bg-slate-700 text-slate-200",
  active: "bg-red-500/15 text-red-300",
  closed: "bg-slate-700 text-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        statusClasses[status] ?? "bg-slate-700 text-slate-200",
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

