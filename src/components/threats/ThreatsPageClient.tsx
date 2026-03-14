"use client";

import { Fragment, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, ScanSearch, ShieldCheck, ShieldEllipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateThreatStatusAction } from "@/app/(dashboard)/threats/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { riskLevelValues, type Threat, type ThreatStats, type ThreatStatus } from "@/types";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Investigating", value: "investigating" },
  { label: "Contained", value: "contained" },
  { label: "Resolved", value: "resolved" },
];
const severityOptions = [
  { label: "All severities", value: "all" },
  ...riskLevelValues.map((value) => ({
    label: value.replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase()),
    value,
  })),
];
const threatTransitions: Record<ThreatStatus, ThreatStatus[]> = {
  active: ["investigating", "contained", "resolved"],
  investigating: ["contained", "resolved"],
  contained: ["resolved"],
  resolved: [],
};
const threatActionLabels: Record<ThreatStatus, string> = {
  active: "Activate",
  investigating: "Investigate",
  contained: "Contain",
  resolved: "Resolve",
};

function formatLabel(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return value.replaceAll("_", " ");
}

function formatProtocol(value: string | null): string {
  if (!value) {
    return "-";
  }

  return value.replaceAll("_", " ").toUpperCase();
}

function formatAddressPath(threat: Threat): string {
  return `${threat.source_ip ?? "-"} -> ${threat.destination_ip ?? "-"}`;
}

export function ThreatsPageClient({
  initialThreats,
  stats,
}: {
  initialThreats: Threat[];
  stats: ThreatStats;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(null);
  const [pendingThreatId, setPendingThreatId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredThreats = initialThreats.filter((threat) => {
    const haystack = [
      threat.title,
      threat.description,
      threat.threat_type,
      threat.source_ip,
      threat.destination_ip,
      threat.mitre_tactic,
      ...(threat.affected_asset_names ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = search.trim().length === 0 || haystack.includes(search.toLowerCase());
    const matchesStatus = status === "all" || threat.status === status;
    const matchesSeverity = severity === "all" || threat.severity === severity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  function runStatusUpdate(threatId: string, nextStatus: ThreatStatus) {
    startTransition(() => {
      setPendingThreatId(threatId);
      void updateThreatStatusAction(threatId, nextStatus)
        .then((result) => {
          if (!result.success) {
            toast.error(result.error ?? "Threat update failed.");
            return;
          }

          toast.success(`Threat moved to ${nextStatus.replaceAll("_", " ")}.`);
          router.refresh();
        })
        .catch(() => {
          toast.error("Threat update failed.");
        })
        .finally(() => {
          setPendingThreatId(null);
        });
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Threats"
        subtitle="Monitor active detections, inspect evidence, and drive the response workflow."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={stats.total} icon={AlertTriangle} />
        <StatCard title="Active" value={stats.active} color="red" icon={AlertTriangle} />
        <StatCard title="Investigating" value={stats.investigating} color="amber" icon={ScanSearch} />
        <StatCard title="Contained" value={stats.contained} color="sky" icon={ShieldEllipsis} />
        <StatCard title="Resolved" value={stats.resolved} color="green" icon={ShieldCheck} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search title, tactic, IP, or affected asset"
          />
          <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
          <FilterSelect value={severity} options={severityOptions} onChange={setSeverity} />
        </div>
      </div>

      {initialThreats.length === 0 ? (
        <EmptyState
          title="No active threats detected"
          description="Threat monitoring is connected, but there are no threat records for this facility yet."
        />
      ) : filteredThreats.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No threats match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source to Destination</th>
                <th className="px-4 py-3 font-medium">Protocol</th>
                <th className="px-4 py-3 font-medium">MITRE Tactic</th>
                <th className="px-4 py-3 font-medium">Detected</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredThreats.map((threat) => {
                const isExpanded = expandedThreatId === threat.id;
                const isRowPending = isPending && pendingThreatId === threat.id;
                const affectedAssets = threat.affected_asset_names?.length
                  ? threat.affected_asset_names
                  : threat.affected_asset_ids;

                return (
                  <Fragment key={threat.id}>
                    <tr
                      className="cursor-pointer hover:bg-slate-800/40"
                      onClick={() =>
                        setExpandedThreatId((current) => (current === threat.id ? null : threat.id))
                      }
                    >
                      <td className="px-4 py-3 align-top">
                        <RiskBadge level={threat.severity} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium">{threat.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {threat.description ?? "No description provided."}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                          {formatLabel(threat.threat_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-slate-300">
                        {formatAddressPath(threat)}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {threat.protocol ? (
                          <span className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                            {formatProtocol(threat.protocol)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">
                        {threat.mitre_tactic ?? "-"}
                      </td>
                      <td className="px-4 py-3 align-top text-slate-400">
                        {formatDistanceToNow(new Date(threat.detected_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={threat.status} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                          {threatTransitions[threat.status].map((nextStatus) => (
                            <button
                              key={nextStatus}
                              className={
                                nextStatus === "resolved"
                                  ? "rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-green-500 hover:text-green-300 disabled:opacity-50"
                                  : nextStatus === "contained"
                                    ? "rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300 disabled:opacity-50"
                                    : "rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-amber-500 hover:text-amber-300 disabled:opacity-50"
                              }
                              disabled={isRowPending}
                              onClick={() => runStatusUpdate(threat.id, nextStatus)}
                              type="button"
                            >
                              {threatActionLabels[nextStatus]}
                            </button>
                          ))}
                          {threatTransitions[threat.status].length === 0 ? (
                            <span className="inline-flex items-center rounded-md border border-slate-800 px-3 py-1.5 text-xs text-slate-500">
                              Closed loop
                            </span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="bg-slate-950/40">
                        <td className="px-4 py-4" colSpan={9}>
                          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                                <p className="mt-2 text-sm text-slate-200">
                                  {threat.description ?? "No narrative has been captured for this threat yet."}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Affected Assets</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {affectedAssets.length > 0 ? (
                                    affectedAssets.map((asset) => (
                                      <span
                                        key={asset}
                                        className="inline-flex rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200"
                                      >
                                        {asset}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-slate-400">No related assets attached.</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">MITRE Technique</p>
                                <p className="mt-2 text-sm text-slate-300">{threat.mitre_technique ?? "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Raw Evidence</p>
                              <pre className="mt-2 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
                                {JSON.stringify(threat.raw_evidence ?? {}, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}