"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Vulnerability, VulnerabilityStats } from "@/types";

const severityOptions = [
  { label: "All severities", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];
const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Accepted Risk", value: "accepted_risk" },
  { label: "False Positive", value: "false_positive" },
];

function scoreColor(score: number | null): string {
  if (score === null) {
    return "text-slate-400";
  }

  if (score >= 9) {
    return "text-red-300";
  }

  if (score >= 7) {
    return "text-amber-300";
  }

  if (score >= 4) {
    return "text-yellow-300";
  }

  return "text-green-300";
}

export function VulnerabilitiesPageClient({
  initialVulns,
  stats,
}: {
  initialVulns: Vulnerability[];
  stats: VulnerabilityStats;
}) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredVulnerabilities = initialVulns.filter((vulnerability) => {
    const haystack = [vulnerability.title, vulnerability.cve_id, vulnerability.asset_name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = search.trim().length === 0 || haystack.includes(search.toLowerCase());
    const matchesSeverity = severity === "all" || vulnerability.severity === severity;
    const matchesStatus = status === "all" || vulnerability.status === status;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Vulnerabilities"
        subtitle="Current asset exposure with severity and remediation state filters."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Open" value={stats.open} color="red" />
        <StatCard title="Critical" value={stats.critical} color="red" />
        <StatCard title="High" value={stats.high} color="amber" />
        <StatCard title="Resolved" value={stats.resolved} color="green" />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search title, CVE, or asset"
          />
          <FilterSelect value={severity} options={severityOptions} onChange={setSeverity} />
          <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
        </div>
      </div>

      {initialVulns.length === 0 ? (
        <EmptyState
          title="No vulnerabilities found"
          description="The vulnerability scanner is connected, but there are no findings for this facility yet."
        />
      ) : filteredVulnerabilities.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No vulnerabilities match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Finding</th>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">CVSS</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Discovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredVulnerabilities.map((vulnerability) => (
                <tr key={vulnerability.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 align-top">
                    <RiskBadge level={vulnerability.severity} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{vulnerability.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{vulnerability.cve_id ?? "No CVE"}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">{vulnerability.asset_name ?? "-"}</td>
                  <td className={`px-4 py-3 align-top font-semibold ${scoreColor(vulnerability.cvss_score)}`}>
                    {vulnerability.cvss_score?.toFixed(1) ?? "-"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={vulnerability.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-400">
                    {new Date(vulnerability.discovered_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
