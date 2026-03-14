"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Alert, AlertStats } from "@/types";

export function AlertsTable({
  initialAlerts,
  initialStats,
}: {
  initialAlerts: Alert[];
  initialStats: AlertStats;
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Alerts"
        subtitle="Phase 5A should replace this shell with filtering, actions, and optimistic updates."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="New" value={initialStats.new} color="red" />
        <StatCard title="Critical" value={initialStats.critical} color="red" />
        <StatCard title="High" value={initialStats.high} color="amber" />
        <StatCard title="Acknowledged Today" value={initialStats.acknowledged_today} color="sky" />
      </div>
      {initialAlerts.length === 0 ? (
        <EmptyState
          title="No alerts"
          description="The data contract is in place. Wire alert actions and realtime updates in the monitoring module."
        />
      ) : null}
    </section>
  );
}

