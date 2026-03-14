"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Threat, ThreatStats } from "@/types";

export function ThreatsPageClient({
  initialThreats,
  stats,
}: {
  initialThreats: Threat[];
  stats: ThreatStats;
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Threats"
        subtitle="Phase 5C should wire severity filters, status transitions, and evidence rendering here."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Active" value={stats.active} color="red" />
        <StatCard title="Investigating" value={stats.investigating} color="amber" />
        <StatCard title="Contained" value={stats.contained} color="sky" />
        <StatCard title="Resolved" value={stats.resolved} color="green" />
      </div>
      {initialThreats.length === 0 ? (
        <EmptyState
          title="No active threats detected"
          description="Threat monitoring and status actions belong in the monitoring module."
        />
      ) : null}
    </section>
  );
}

