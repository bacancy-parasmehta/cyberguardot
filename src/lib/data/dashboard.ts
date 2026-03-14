import type { DashboardSummary } from "@/types";
import { getAlerts } from "@/lib/data/alerts";
import { getAssets } from "@/lib/data/assets";
import { getIncidents } from "@/lib/data/incidents";
import {
  buildAlertStats,
  buildAssetRiskDistribution,
  buildAssetStats,
  buildIncidentStats,
  buildRiskTrend,
  buildThreatStats,
  buildVulnerabilityBreakdown,
  buildVulnerabilityStats,
} from "@/lib/data/stats";
import { getThreats } from "@/lib/data/threats";
import { getVulnerabilities } from "@/lib/data/vulnerabilities";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [assets, vulnerabilities, threats, incidents, alerts] = await Promise.all([
    getAssets(),
    getVulnerabilities(),
    getThreats(),
    getIncidents(),
    getAlerts(),
  ]);

  return {
    assets: buildAssetStats(assets),
    vulnerabilities: buildVulnerabilityStats(vulnerabilities),
    threats: buildThreatStats(threats),
    incidents: buildIncidentStats(incidents),
    alerts: buildAlertStats(alerts),
    vulnerability_breakdown: buildVulnerabilityBreakdown(vulnerabilities),
    asset_risk_distribution: buildAssetRiskDistribution(assets),
    recent_alerts: alerts.slice(0, 5),
    recent_incidents: incidents.slice(0, 5),
    risk_trend: buildRiskTrend(30, assets, vulnerabilities, alerts),
  };
}

export async function getRiskTrend(
  days: number,
): Promise<Array<{ date: string; score: number }>> {
  const [assets, vulnerabilities, alerts] = await Promise.all([
    getAssets(),
    getVulnerabilities(),
    getAlerts(),
  ]);

  return buildRiskTrend(days, assets, vulnerabilities, alerts);
}
