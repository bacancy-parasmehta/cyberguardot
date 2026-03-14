import type { DashboardSummary } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return {
    assets: {
      total: 0,
      online: 0,
      offline: 0,
      degraded: 0,
      critical_risk: 0,
      high_risk: 0,
    },
    vulnerabilities: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      resolved: 0,
    },
    threats: {
      total: 0,
      active: 0,
      investigating: 0,
      contained: 0,
      resolved: 0,
    },
    incidents: {
      total: 0,
      open: 0,
      investigating: 0,
      contained: 0,
      resolved: 0,
      avg_resolution_hours: 0,
    },
    alerts: {
      total: 0,
      new: 0,
      critical: 0,
      high: 0,
      acknowledged_today: 0,
    },
    recent_alerts: [],
    recent_incidents: [],
    risk_trend: [],
  };
}

export async function getRiskTrend(
  _days: number,
): Promise<Array<{ date: string; score: number }>> {
  return [];
}

