import { VulnerabilitiesPageClient } from "@/components/vulnerabilities/VulnerabilitiesPageClient";
import {
  getVulnerabilities,
  getVulnerabilityStats,
} from "@/lib/data/vulnerabilities";

export default async function VulnerabilitiesPage() {
  const [vulnerabilities, stats] = await Promise.all([
    getVulnerabilities(),
    getVulnerabilityStats(),
  ]);

  return (
    <VulnerabilitiesPageClient initialVulns={vulnerabilities} stats={stats} />
  );
}
