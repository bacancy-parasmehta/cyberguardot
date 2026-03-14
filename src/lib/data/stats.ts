import {
  differenceInHours,
  eachDayOfInterval,
  endOfDay,
  format,
  isToday,
  parseISO,
  startOfToday,
  subDays,
} from "date-fns";

import type {
  Alert,
  AlertPriority,
  AlertStats,
  Asset,
  AssetStats,
  Incident,
  IncidentStats,
  RiskLevel,
  Threat,
  ThreatStats,
  Vulnerability,
  VulnerabilityStats,
} from "@/types";

const vulnerabilityLevels: Array<Exclude<RiskLevel, "informational">> = [
  "critical",
  "high",
  "medium",
  "low",
];
const assetDistributionLevels: RiskLevel[] = ["critical", "high", "medium", "low"];
const vulnerabilityWeights: Record<RiskLevel, number> = {
  critical: 14,
  high: 9,
  medium: 5,
  low: 2,
  informational: 1,
};
const alertWeights: Record<AlertPriority, number> = {
  critical: 10,
  high: 6,
  medium: 3,
  low: 1,
};

function safeDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isActiveOnDate(
  startedAt: string | null | undefined,
  dayEnd: Date,
  endedAt?: string | null,
): boolean {
  const start = safeDate(startedAt);
  const end = safeDate(endedAt);

  if (!start || start > dayEnd) {
    return false;
  }

  return !end || end > dayEnd;
}

export function buildAssetStats(assets: Asset[]): AssetStats {
  return {
    total: assets.length,
    online: assets.filter((asset) => asset.status === "online").length,
    offline: assets.filter((asset) => asset.status === "offline").length,
    degraded: assets.filter((asset) => asset.status === "degraded").length,
    critical_risk: assets.filter((asset) => asset.risk_level === "critical").length,
    high_risk: assets.filter((asset) => asset.risk_level === "high").length,
  };
}

export function buildVulnerabilityStats(
  vulnerabilities: Vulnerability[],
): VulnerabilityStats {
  return {
    total: vulnerabilities.length,
    critical: vulnerabilities.filter((vulnerability) => vulnerability.severity === "critical")
      .length,
    high: vulnerabilities.filter((vulnerability) => vulnerability.severity === "high").length,
    medium: vulnerabilities.filter((vulnerability) => vulnerability.severity === "medium")
      .length,
    low: vulnerabilities.filter((vulnerability) => vulnerability.severity === "low").length,
    open: vulnerabilities.filter((vulnerability) => vulnerability.status === "open").length,
    resolved: vulnerabilities.filter((vulnerability) => vulnerability.status === "resolved")
      .length,
  };
}

export function buildThreatStats(threats: Threat[]): ThreatStats {
  return {
    total: threats.length,
    active: threats.filter((threat) => threat.status === "active").length,
    investigating: threats.filter((threat) => threat.status === "investigating").length,
    contained: threats.filter((threat) => threat.status === "contained").length,
    resolved: threats.filter((threat) => threat.status === "resolved").length,
  };
}

export function buildIncidentStats(incidents: Incident[]): IncidentStats {
  const resolutionHours = incidents
    .filter((incident) => incident.resolved_at)
    .map((incident) => {
      const openedAt = safeDate(incident.opened_at);
      const resolvedAt = safeDate(incident.resolved_at);

      if (!openedAt || !resolvedAt) {
        return 0;
      }

      return Math.max(differenceInHours(resolvedAt, openedAt), 0);
    })
    .filter((hours) => hours > 0);

  return {
    total: incidents.length,
    open: incidents.filter((incident) => incident.status === "open").length,
    investigating: incidents.filter((incident) => incident.status === "investigating").length,
    contained: incidents.filter((incident) => incident.status === "contained").length,
    resolved: incidents.filter(
      (incident) => incident.status === "resolved" || incident.status === "closed",
    ).length,
    avg_resolution_hours:
      resolutionHours.length > 0
        ? Number(
            (
              resolutionHours.reduce((total, hours) => total + hours, 0) /
              resolutionHours.length
            ).toFixed(1),
          )
        : 0,
  };
}

export function buildAlertStats(alerts: Alert[]): AlertStats {
  const activeAlerts = alerts.filter(
    (alert) => alert.status !== "resolved" && alert.status !== "suppressed",
  );

  return {
    total: alerts.length,
    new: alerts.filter((alert) => alert.status === "new").length,
    critical: activeAlerts.filter((alert) => alert.priority === "critical").length,
    high: activeAlerts.filter((alert) => alert.priority === "high").length,
    acknowledged_today: alerts.filter(
      (alert) => alert.acknowledged_at && isToday(safeDate(alert.acknowledged_at) ?? new Date(0)),
    ).length,
  };
}

export function buildVulnerabilityBreakdown(
  vulnerabilities: Vulnerability[],
): Array<{ level: RiskLevel; count: number }> {
  return vulnerabilityLevels.map((level) => ({
    level,
    count: vulnerabilities.filter((vulnerability) => vulnerability.severity === level).length,
  }));
}

export function buildAssetRiskDistribution(
  assets: Asset[],
): Array<{ level: RiskLevel; count: number }> {
  return assetDistributionLevels.map((level) => ({
    level,
    count: assets.filter((asset) => {
      if (level === "low") {
        return asset.risk_level === "low" || asset.risk_level === "informational";
      }

      return asset.risk_level === level;
    }).length,
  }));
}

export function buildRiskTrend(
  days: number,
  assets: Asset[],
  vulnerabilities: Vulnerability[],
  alerts: Alert[],
): Array<{ date: string; score: number }> {
  if (assets.length === 0 && vulnerabilities.length === 0 && alerts.length === 0) {
    return [];
  }

  const end = startOfToday();
  const start = subDays(end, Math.max(days - 1, 0));

  return eachDayOfInterval({ start, end }).map((day) => {
    const dayEnd = endOfDay(day);
    const activeAssets = assets.filter((asset) =>
      isActiveOnDate(asset.first_discovered, dayEnd),
    );
    const assetBase =
      activeAssets.length > 0
        ? activeAssets.reduce((total, asset) => total + asset.risk_score, 0) /
          activeAssets.length
        : 0;
    const vulnerabilityLoad = vulnerabilities
      .filter(
        (vulnerability) =>
          vulnerability.status !== "false_positive" &&
          isActiveOnDate(
            vulnerability.discovered_at,
            dayEnd,
            vulnerability.status === "resolved" ? vulnerability.resolved_at : null,
          ),
      )
      .reduce((total, vulnerability) => total + vulnerabilityWeights[vulnerability.severity], 0);
    const alertLoad = alerts
      .filter(
        (alert) =>
          alert.status !== "suppressed" &&
          isActiveOnDate(alert.triggered_at, dayEnd, alert.resolved_at),
      )
      .reduce((total, alert) => total + alertWeights[alert.priority], 0);

    return {
      date: format(day, "MMM d"),
      score: Math.min(
        100,
        Math.round(assetBase * 0.55 + Math.min(vulnerabilityLoad, 32) + Math.min(alertLoad, 18)),
      ),
    };
  });
}
