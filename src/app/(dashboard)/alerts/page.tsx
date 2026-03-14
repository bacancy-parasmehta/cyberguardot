import { AlertsTable } from "@/components/alerts/AlertsTable";
import { getAlerts, getAlertStats } from "@/lib/data/alerts";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const [alerts, stats] = await Promise.all([getAlerts(), getAlertStats()]);

  return <AlertsTable initialAlerts={alerts} initialStats={stats} />;
}
