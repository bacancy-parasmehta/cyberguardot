"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ComplianceControl, ComplianceSummary } from "@/types";

function formatFrameworkLabel(value: string): string {
  return value.replaceAll("_", " ").toUpperCase();
}

export function CompliancePageClient({
  controls,
  summary,
}: {
  controls: ComplianceControl[];
  summary: ComplianceSummary[];
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Compliance"
        subtitle="Framework scorecards and current control state from the seeded governance dataset."
      />
      {summary.length === 0 ? (
        <EmptyState
          title="No controls configured"
          description="Compliance scorecards will appear here once controls are loaded for this facility."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <StatCard
              key={item.framework}
              title={formatFrameworkLabel(item.framework)}
              value={`${item.score_percent}%`}
              subtitle={`${item.compliant}/${item.total} controls compliant or partial`}
              color={item.score_percent >= 80 ? "green" : item.score_percent >= 60 ? "amber" : "red"}
            />
          ))}
        </div>
      )}
      {controls.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Framework</th>
                <th className="px-4 py-3 font-medium">Control</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {controls.map((control) => (
                <tr key={control.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 align-top text-slate-300">
                    {formatFrameworkLabel(control.framework)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{control.control_id}</div>
                    <div className="mt-1 text-xs text-slate-500">{control.control_name}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={control.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-400">
                    {control.due_date ? new Date(control.due_date).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
