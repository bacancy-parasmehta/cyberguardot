import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardColor = "default" | "red" | "amber" | "green" | "sky";

const colorStyles: Record<StatCardColor, string> = {
  default: "border-slate-700",
  red: "border-red-500/50",
  amber: "border-amber-500/50",
  green: "border-green-500/50",
  sky: "border-sky-500/50",
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: StatCardColor;
  icon?: LucideIcon;
}

export function StatCard({
  title,
  value,
  subtitle,
  color = "default",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-slate-900 p-6", colorStyles[color])}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {Icon ? (
          <span className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-slate-300">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
    </div>
  );
}
