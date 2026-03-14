import { CompliancePageClient } from "@/components/compliance/CompliancePageClient";
import {
  getComplianceControls,
  getComplianceSummary,
} from "@/lib/data/compliance";

export default async function CompliancePage() {
  const [controls, summary] = await Promise.all([
    getComplianceControls(),
    getComplianceSummary(),
  ]);

  return <CompliancePageClient controls={controls} summary={summary} />;
}
