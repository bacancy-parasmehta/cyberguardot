import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { PageHeader } from "@/components/ui/PageHeader";
import { getDashboardSummary } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Facility-wide live posture from the current seeded Supabase data."
      />
      <DashboardOverview summary={summary} />
    </section>
  );
}
