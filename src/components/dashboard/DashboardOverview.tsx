"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Bell, Flame, Server } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { DashboardSummary, RiskLevel } from "@/types";

const chartColors: Record<RiskLevel, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#eab308",
  low: "#22c55e",
  informational: "#94a3b8",
};

function getAssetCardColor(summary: DashboardSummary): "green" | "amber" | "red" {
  if (summary.assets.total === 0) {
    return "amber";
  }

  const onlineRatio = summary.assets.online / summary.assets.total;

  if (onlineRatio >= 0.7) {
    return "green";
  }

  if (onlineRatio >= 0.4) {
    return "amber";
  }

  return "red";
}

function hasChartData(items: Array<{ count: number }>): boolean {
  return items.some((item) => item.count > 0);
}

export function DashboardOverview({ summary }: { summary: DashboardSummary }) {
  const assetRiskData = summary.asset_risk_distribution.map((item) => ({
    ...item,
    label: item.level === "low" ? "Low / Info" : item.level,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={summary.assets.total}
          subtitle={`${summary.assets.online} online / ${summary.assets.offline} offline`}
          color={getAssetCardColor(summary)}
          icon={Server}
        />
        <StatCard
          title="Active Threats"
          value={summary.threats.active}
          subtitle={`${summary.threats.investigating} investigating`}
          color={summary.threats.active > 0 ? "red" : "green"}
          icon={AlertTriangle}
        />
        <StatCard
          title="Open Incidents"
          value={summary.incidents.open}
          subtitle={`${summary.incidents.contained} contained`}
          color={summary.incidents.open > 0 ? "amber" : "green"}
          icon={Flame}
        />
        <StatCard
          title="New Alerts"
          value={summary.alerts.new}
          subtitle={`${summary.alerts.critical} critical active`}
          color={summary.alerts.critical > 0 ? "red" : "amber"}
          icon={Bell}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Vulnerability Breakdown</h2>
              <p className="text-sm text-slate-400">Current severity distribution</p>
            </div>
          </div>
          {hasChartData(summary.vulnerability_breakdown) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.vulnerability_breakdown}>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="level" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ border: "1px solid #334155", backgroundColor: "#0f172a" }}
                    cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {summary.vulnerability_breakdown.map((entry) => (
                      <Cell key={entry.level} fill={chartColors[entry.level]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
              No vulnerability data is available yet.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Asset Risk Distribution</h2>
              <p className="text-sm text-slate-400">Risk posture across the facility inventory</p>
            </div>
          </div>
          {hasChartData(assetRiskData) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetRiskData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {assetRiskData.map((entry) => (
                      <Cell key={entry.level} fill={chartColors[entry.level]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ border: "1px solid #334155", backgroundColor: "#0f172a" }}
                  />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
              No asset inventory has been scored yet.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Alerts</h2>
              <p className="text-sm text-slate-400">Most recent monitoring events</p>
            </div>
            <Link className="text-sm text-sky-400 hover:text-sky-300" href="/alerts">
              View all
            </Link>
          </div>
          {summary.recent_alerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="text-left text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Priority</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-white">
                  {summary.recent_alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <RiskBadge level={alert.priority} />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="max-w-xs truncate font-medium">{alert.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{alert.rule_name ?? "Unclassified rule"}</div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{alert.asset_name ?? "-"}</td>
                      <td className="py-3 text-slate-400">
                        {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
              No alerts have been triggered yet.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Incidents</h2>
              <p className="text-sm text-slate-400">Response activity and triage state</p>
            </div>
            <Link className="text-sm text-sky-400 hover:text-sky-300" href="/incidents">
              View all
            </Link>
          </div>
          {summary.recent_incidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="text-left text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Severity</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-white">
                  {summary.recent_incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-slate-800/30">
                      <td className="py-3 pr-4">
                        <RiskBadge level={incident.severity} />
                      </td>
                      <td className="py-3 pr-4 font-medium">{incident.title}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={incident.status} />
                      </td>
                      <td className="py-3 text-slate-400">
                        {formatDistanceToNow(new Date(incident.opened_at), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
              No incidents have been opened yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">30-Day Risk Trend</h2>
          <p className="text-sm text-slate-400">Blended operational risk score from assets, vulnerabilities, and alerts</p>
        </div>
        {summary.risk_trend.length > 1 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.risk_trend}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={24} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ border: "1px solid #334155", backgroundColor: "#0f172a" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-sm text-slate-400">
            Insufficient data to render a 30-day risk trend yet.
          </p>
        )}
      </div>
    </div>
  );
}
