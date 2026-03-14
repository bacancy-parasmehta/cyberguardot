"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Flame, ScanSearch, ShieldCheck, ShieldEllipsis, Siren } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { incidentSeverityValues, type Incident, type IncidentStats } from "@/types";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Contained", value: "contained" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];
const severityOptions = [
  { label: "All severities", value: "all" },
  ...incidentSeverityValues.map((value) => ({
    label: value.replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase()),
    value,
  })),
];

export function IncidentsPageClient({
  initialIncidents,
  stats,
}: {
  initialIncidents: Incident[];
  stats: IncidentStats;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const router = useRouter();

  const filteredIncidents = initialIncidents.filter((incident) => {
    const haystack = [
      incident.title,
      incident.description,
      incident.assignee_name,
      incident.creator_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = search.trim().length === 0 || haystack.includes(search.toLowerCase());
    const matchesStatus = status === "all" || incident.status === status;
    const matchesSeverity = severity === "all" || incident.severity === severity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title="Incidents"
        subtitle="Track active response work, ownership, and lifecycle progression across the facility."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} icon={Flame} />
        <StatCard title="Open" value={stats.open} color="red" icon={Siren} />
        <StatCard title="Investigating" value={stats.investigating} color="amber" icon={ScanSearch} />
        <StatCard title="Contained" value={stats.contained} color="sky" icon={ShieldEllipsis} />
        <StatCard title="Resolved" value={stats.resolved} color="green" icon={ShieldCheck} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search title, owner, or creator"
          />
          <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
          <FilterSelect value={severity} options={severityOptions} onChange={setSeverity} />
        </div>
      </div>

      {initialIncidents.length === 0 ? (
        <EmptyState
          title="No incidents"
          description="The response workspace is ready, but there are no incident records for this facility yet."
        />
      ) : filteredIncidents.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No incidents match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned To</th>
                <th className="px-4 py-3 font-medium">Opened</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="cursor-pointer hover:bg-slate-800/40"
                  onClick={() => router.push(`/incidents/${incident.id}`)}
                >
                  <td className="px-4 py-3 align-top">
                    <RiskBadge level={incident.severity} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{incident.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {incident.description ?? "No description provided."}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-300">
                    {incident.assignee_name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-400">
                    {formatDistanceToNow(new Date(incident.opened_at), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/incidents/${incident.id}`);
                      }}
                      type="button"
                    >
                      View
                    </button>
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