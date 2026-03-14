"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Vulnerability, VulnerabilityStats } from "@/types";

export function VulnerabilitiesPageClient({
  initialVulns,
  stats,
}: {
  initialVulns: Vulnerability[];
  stats: VulnerabilityStats;
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Vulnerabilities"
        subtitle="Phase 5B should wire vulnerability actions, assignment, and expandable rows here."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Open" value={stats.open} color="red" />
        <StatCard title="Critical" value={stats.critical} color="red" />
        <StatCard title="High" value={stats.high} color="amber" />
        <StatCard title="Resolved" value={stats.resolved} color="green" />
      </div>
      {initialVulns.length === 0 ? (
        <EmptyState
          title="No vulnerabilities found"
          description="The module boundary is ready. Connect vulnerability data and actions next."
        />
      ) : null}
    </section>
  );
}

