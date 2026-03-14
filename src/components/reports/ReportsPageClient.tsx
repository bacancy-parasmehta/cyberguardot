"use client";

import { useState } from "react";
import { Download, FileCode2, FileJson2, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/ui/PageHeader";
import { jsonToCSV } from "@/lib/utils/csv";
import type {
  Alert,
  Asset,
  ComplianceControl,
  ComplianceSummary,
  DashboardSummary,
  Incident,
  Vulnerability,
} from "@/types";

type ReportType =
  | "executive_summary"
  | "vulnerability_report"
  | "incident_report"
  | "compliance_report"
  | "asset_inventory";
type ReportFormat = "pdf" | "csv" | "json";

const reportTypeOptions: Array<{ label: string; value: ReportType }> = [
  { label: "Executive Summary", value: "executive_summary" },
  { label: "Vulnerability Report", value: "vulnerability_report" },
  { label: "Incident Report", value: "incident_report" },
  { label: "Compliance Report", value: "compliance_report" },
  { label: "Asset Inventory", value: "asset_inventory" },
];
const staticSavedReports = [
  {
    name: "Board Risk Snapshot",
    type: "Executive Summary",
    generated: "Mar 10, 2026",
    format: "PDF",
  },
  {
    name: "Open Vulnerability Review",
    type: "Vulnerability Report",
    generated: "Mar 08, 2026",
    format: "CSV",
  },
  {
    name: "Monthly Compliance Status",
    type: "Compliance Report",
    generated: "Mar 01, 2026",
    format: "JSON",
  },
];

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function downloadTextFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function inRange(dateValue: string | null | undefined, from: string, to: string): boolean {
  if (!from && !to) {
    return true;
  }

  if (!dateValue) {
    return false;
  }

  const value = new Date(dateValue).getTime();
  const fromTime = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(`${to}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;

  return value >= fromTime && value <= toTime;
}

export function ReportsPageClient({
  summary,
  alerts,
  assets,
  vulnerabilities,
  incidents,
  complianceControls,
  complianceSummary,
}: {
  summary: DashboardSummary;
  alerts: Alert[];
  assets: Asset[];
  vulnerabilities: Vulnerability[];
  incidents: Incident[];
  complianceControls: ComplianceControl[];
  complianceSummary: ComplianceSummary[];
}) {
  const [reportType, setReportType] = useState<ReportType>("executive_summary");
  const [reportFormat, setReportFormat] = useState<ReportFormat>("json");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function buildReportPayload() {
    switch (reportType) {
      case "executive_summary": {
        const filteredAssets = assets.filter((asset) => inRange(asset.first_discovered, fromDate, toDate));
        const filteredVulnerabilities = vulnerabilities.filter((vulnerability) =>
          inRange(vulnerability.discovered_at, fromDate, toDate),
        );
        const filteredIncidents = incidents.filter((incident) =>
          inRange(incident.opened_at, fromDate, toDate),
        );
        const filteredAlerts = alerts.filter((alert) => inRange(alert.triggered_at, fromDate, toDate));

        return {
          generated_at: new Date().toISOString(),
          date_range: {
            from: fromDate || null,
            to: toDate || null,
          },
          totals: {
            assets: filteredAssets.length,
            vulnerabilities: filteredVulnerabilities.length,
            incidents: filteredIncidents.length,
            alerts: filteredAlerts.length,
          },
          posture: {
            critical_assets: filteredAssets.filter((asset) => asset.risk_level === "critical").length,
            open_vulnerabilities: filteredVulnerabilities.filter((vulnerability) => vulnerability.status === "open").length,
            active_incidents: filteredIncidents.filter((incident) => incident.status !== "closed").length,
            new_alerts: filteredAlerts.filter((alert) => alert.status === "new").length,
          },
          summary,
        };
      }
      case "vulnerability_report":
        return vulnerabilities.filter((vulnerability) =>
          inRange(vulnerability.discovered_at, fromDate, toDate),
        );
      case "incident_report":
        return incidents.filter((incident) => inRange(incident.opened_at, fromDate, toDate));
      case "compliance_report": {
        const filteredControls = complianceControls.filter((control) =>
          inRange(control.last_assessed_at, fromDate, toDate) || inRange(control.due_date, fromDate, toDate),
        );

        return {
          generated_at: new Date().toISOString(),
          summaries: complianceSummary,
          controls: filteredControls,
        };
      }
      case "asset_inventory":
        return assets.filter((asset) => inRange(asset.first_discovered, fromDate, toDate));
      default:
        return [];
    }
  }

  async function handleGenerateReport() {
    setIsGenerating(true);

    try {
      await sleep(1500);
      const payload = buildReportPayload();
      const dateLabel = new Date().toISOString().slice(0, 10);

      if (reportFormat === "pdf") {
        toast.info("PDF export coming soon - download as JSON or CSV for now.");
        return;
      }

      if (reportFormat === "json") {
        const json = JSON.stringify(payload, null, 2);
        downloadTextFile(json, `cyberguard-${reportType}-${dateLabel}.json`, "application/json");
        toast.success("JSON report downloaded.");
        return;
      }

      const rows = Array.isArray(payload) ? payload : [payload];
      const csv = jsonToCSV(rows as object[]);
      downloadTextFile(csv, `cyberguard-${reportType}-${dateLabel}.csv`, "text/csv;charset=utf-8");
      toast.success("CSV report downloaded.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <PageHeader
          title="Generate Report"
          subtitle="Choose a report type, optional date range, and download format."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm text-slate-300">
            Report Type
            <select
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
              value={reportType}
              onChange={(event) => setReportType(event.target.value as ReportType)}
            >
              {reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-slate-300">
              From
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
            <label className="text-sm text-slate-300">
              To
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {([
            ["json", FileJson2],
            ["csv", FileSpreadsheet],
            ["pdf", FileCode2],
          ] as const).map(([value, Icon]) => (
            <button
              key={value}
              className={
                reportFormat === value
                  ? "inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
                  : "inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300"
              }
              onClick={() => setReportFormat(value)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {value.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGenerating}
          onClick={handleGenerateReport}
          type="button"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {isGenerating ? "Generating..." : "Generate Report"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <PageHeader
          title="Saved Reports"
          subtitle="Placeholder history for the MVP preview."
        />
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="pb-3 font-medium">Report Name</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Generated</th>
                <th className="pb-3 font-medium">Format</th>
                <th className="pb-3 font-medium">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {staticSavedReports.map((report) => (
                <tr key={report.name}>
                  <td className="py-3 pr-4 font-medium">{report.name}</td>
                  <td className="py-3 pr-4 text-slate-300">{report.type}</td>
                  <td className="py-3 pr-4 text-slate-400">{report.generated}</td>
                  <td className="py-3 pr-4 text-slate-300">{report.format}</td>
                  <td className="py-3">
                    <button
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-500"
                      disabled
                      title="Regenerate to download"
                      type="button"
                    >
                      Unavailable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <PageHeader
          title="Scheduled Reports"
          subtitle="Enterprise-only scheduling preview for stakeholders."
        />
        <div className="mt-6 space-y-4">
          {[
            {
              label: "Weekly Executive Summary",
              description: "A Monday morning roll-up of risk posture, incidents, and alert trends.",
            },
            {
              label: "Monthly Compliance Report",
              description: "Framework scorecards and overdue control actions for governance review.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="mt-1 text-sm text-slate-400">{item.description}</p>
              </div>
              <button
                className="h-6 w-12 rounded-full bg-sky-500/70 p-1"
                type="button"
              >
                <span className="block h-4 w-4 translate-x-6 rounded-full bg-white" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Scheduling available in Enterprise plan.</p>
      </div>
    </div>
  );
}