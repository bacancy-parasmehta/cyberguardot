import { IncidentsPageClient } from "@/components/incidents/IncidentsPageClient";
import { getIncidents, getIncidentStats } from "@/lib/data/incidents";

export default async function IncidentsPage() {
  const [incidents, stats] = await Promise.all([
    getIncidents(),
    getIncidentStats(),
  ]);

  return <IncidentsPageClient initialIncidents={incidents} stats={stats} />;
}
