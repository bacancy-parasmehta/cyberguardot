"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { StatCard } from "@/components/ui/StatCard";
import type { DashboardSummary } from "@/types";

export function LiveStats({ summary }: { summary: DashboardSummary }) {
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  function refresh() {
    setRefreshing(true);
    setLastUpdated(new Date());
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 500);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Overview</h2>
          <p className="text-sm text-slate-400">
            Last updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200"
          onClick={refresh}
          type="button"
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Assets" value={summary.assets.total} />
        <StatCard title="Active Threats" value={summary.threats.active} color="red" />
        <StatCard title="Open Incidents" value={summary.incidents.open} color="amber" />
        <StatCard title="New Alerts" value={summary.alerts.new} color="sky" />
      </div>
    </section>
  );
}

