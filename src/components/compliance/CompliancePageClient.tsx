"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ComplianceControl, ComplianceSummary } from "@/types";

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
        subtitle="Phase 5C should expand this shell into framework scorecards and inline control updates."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.length === 0 ? (
          <EmptyState
            title="No controls configured"
            description="Compliance scorecards and control tables should be wired in the governance module."
          />
        ) : (
          summary.map((item) => (
            <div
              key={item.framework}
              className="rounded-xl border border-slate-700 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">{item.framework}</p>
              <p className="mt-3 text-3xl font-bold text-white">
                {item.score_percent}%
              </p>
            </div>
          ))
        )}
      </div>
      {controls.length === 0 ? null : (
        <p className="text-sm text-slate-400">
          {controls.length} compliance controls loaded.
        </p>
      )}
    </section>
  );
}

