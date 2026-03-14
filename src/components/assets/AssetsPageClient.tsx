"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import type { Asset, AssetStats } from "@/types";

export function AssetsPageClient({
  initialAssets,
  stats,
}: {
  initialAssets: Asset[];
  stats: AssetStats;
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title="Assets"
        subtitle="Phase 5B inventory shell with module-ready stats and table space."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Online" value={stats.online} color="green" />
        <StatCard title="Offline" value={stats.offline} color="red" />
        <StatCard title="Degraded" value={stats.degraded} color="amber" />
        <StatCard title="Critical Risk" value={stats.critical_risk} color="red" />
      </div>
      {initialAssets.length === 0 ? (
        <EmptyState
          title="No assets discovered yet"
          description="Phase 5B should wire search, filters, and the add-asset modal here."
        />
      ) : null}
    </section>
  );
}

