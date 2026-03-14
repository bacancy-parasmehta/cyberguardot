import { LiveStats } from "@/components/dashboard/LiveStats";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDashboardSummary } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Module-wise foundation for KPI cards, charts, and recent activity."
      />
      <LiveStats summary={summary} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Risk Overview</h2>
          <p className="mt-3 text-sm text-slate-400">
            Phase 5A should replace this block with vulnerability and asset risk charts.
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <p className="mt-3 text-sm text-slate-400">
            Phase 5A should render recent alerts and incidents tables here.
          </p>
        </div>
      </div>
    </section>
  );
}