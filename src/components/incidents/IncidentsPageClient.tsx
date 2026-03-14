"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Incident, IncidentStats } from "@/types";

export function IncidentsPageClient({
  initialIncidents,
  stats,
}: {
  initialIncidents: Incident[];
  stats: IncidentStats;
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Incidents"
        subtitle="Phase 5C should expand this shell into a full incident management workspace."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Open" value={stats.open} color="red" />
        <StatCard title="Investigating" value={stats.investigating} color="amber" />
        <StatCard title="Contained" value={stats.contained} color="sky" />
        <StatCard title="Resolved" value={stats.resolved} color="green" />
      </div>
      {initialIncidents.length === 0 ? (
        <EmptyState
          title="No incidents"
          description="Incident table, detail routes, and timeline actions belong in the monitoring module."
        />
      ) : null}
    </section>
  );
}

