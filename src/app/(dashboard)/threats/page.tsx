import { ThreatsPageClient } from "@/components/threats/ThreatsPageClient";
import { getThreats, getThreatStats } from "@/lib/data/threats";

export default async function ThreatsPage() {
  const [threats, stats] = await Promise.all([getThreats(), getThreatStats()]);

  return <ThreatsPageClient initialThreats={threats} stats={stats} />;
}
