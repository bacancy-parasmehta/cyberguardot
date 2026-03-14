import { PageHeader } from "@/components/ui/PageHeader";
import { getAlerts } from "@/lib/data/alerts";
import { getAssets } from "@/lib/data/assets";
import { getComplianceControls, getComplianceSummary } from "@/lib/data/compliance";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { getIncidents } from "@/lib/data/incidents";
import { getVulnerabilities } from "@/lib/data/vulnerabilities";
import { ReportsPageClient } from "@/components/reports/ReportsPageClient";

export default async function ReportsPage() {
  const [summary, alerts, assets, vulnerabilities, incidents, complianceControls, complianceSummary] =
    await Promise.all([
      getDashboardSummary(),
      getAlerts(),
      getAssets(),
      getVulnerabilities(),
      getIncidents(),
      getComplianceControls(),
      getComplianceSummary(),
    ]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Generate stakeholder-friendly JSON and CSV exports from the live facility data."
      />
      <ReportsPageClient
        summary={summary}
        alerts={alerts}
        assets={assets}
        vulnerabilities={vulnerabilities}
        incidents={incidents}
        complianceControls={complianceControls}
        complianceSummary={complianceSummary}
      />
    </section>
  );
}
