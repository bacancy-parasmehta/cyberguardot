"use client";

import { Fragment, useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  acknowledgeAlertAction,
  bulkAcknowledgeAlertsAction,
  resolveAlertAction,
  suppressAlertAction,
} from "@/app/(dashboard)/alerts/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Alert, AlertStats } from "@/types";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "New", value: "new" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Resolved", value: "resolved" },
  { label: "Suppressed", value: "suppressed" },
];
const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export function AlertsTable({
  initialAlerts,
  initialStats,
}: {
  initialAlerts: Alert[];
  initialStats: AlertStats;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredAlerts = initialAlerts.filter((alert) => {
    const matchesSearch =
      search.trim().length === 0 ||
      alert.title.toLowerCase().includes(search.toLowerCase()) ||
      (alert.source ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (alert.asset_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || alert.status === status;
    const matchesPriority = priority === "all" || alert.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const allFilteredSelected =
    filteredAlerts.length > 0 && filteredAlerts.every((alert) => selectedIds.includes(alert.id));

  function toggleSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !filteredAlerts.some((alert) => alert.id === id)),
      );
      return;
    }

    setSelectedIds((current) => [
      ...current,
      ...filteredAlerts
        .map((alert) => alert.id)
        .filter((id) => !current.includes(id)),
    ]);
  }

  function runAction(
    key: string,
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    afterSuccess?: () => void,
  ) {
    startTransition(() => {
      setPendingActionKey(key);
      void action()
        .then((result) => {
          if (!result.success) {
            toast.error(result.error ?? "Action failed.");
            return;
          }

          afterSuccess?.();
          toast.success(successMessage);
          router.refresh();
        })
        .catch(() => {
          toast.error("Action failed.");
        })
        .finally(() => {
          setPendingActionKey(null);
        });
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Alerts"
        subtitle="Triaged alert feed with live filtering and workflow actions."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="New" value={initialStats.new} color="red" icon={Bell} />
        <StatCard title="Critical" value={initialStats.critical} color="red" icon={Bell} />
        <StatCard title="High" value={initialStats.high} color="amber" icon={Eye} />
        <StatCard
          title="Acknowledged Today"
          value={initialStats.acknowledged_today}
          color="sky"
          icon={Check}
        />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-3 md:grid-cols-3 lg:flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search title, source, or asset"
            />
            <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
            <FilterSelect
              value={priority}
              options={priorityOptions}
              onChange={setPriority}
            />
          </div>
          {selectedIds.length > 0 ? (
            <button
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              onClick={() =>
                runAction(
                  "bulk-acknowledge",
                  () => bulkAcknowledgeAlertsAction(selectedIds),
                  `${selectedIds.length} alert(s) acknowledged.`,
                  () => setSelectedIds([]),
                )
              }
              type="button"
            >
              Acknowledge Selected ({selectedIds.length})
            </button>
          ) : null}
        </div>
      </div>

      {initialAlerts.length === 0 ? (
        <EmptyState
          title="No alerts"
          description="The monitoring pipeline is connected, but no alert records exist for this facility yet."
        />
      ) : filteredAlerts.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No alerts match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">
                  <input
                    checked={allFilteredSelected}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-950"
                    onChange={toggleSelectAll}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Triggered</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredAlerts.map((alert) => {
                const pendingForRow =
                  isPending &&
                  (pendingActionKey === alert.id || pendingActionKey === `resolve:${alert.id}` || pendingActionKey === `suppress:${alert.id}` || pendingActionKey === `ack:${alert.id}`);

                return (
                  <Fragment key={alert.id}>
                    <tr
                      key={alert.id}
                      className="cursor-pointer hover:bg-slate-800/40"
                      onClick={() =>
                        setExpandedAlertId((current) => (current === alert.id ? null : alert.id))
                      }
                    >
                      <td className="px-4 py-3 align-top">
                        <input
                          checked={selectedIds.includes(alert.id)}
                          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950"
                          onChange={() => toggleSelection(alert.id)}
                          onClick={(event) => event.stopPropagation()}
                          type="checkbox"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <RiskBadge level={alert.priority} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="max-w-md truncate font-medium">{alert.title}</div>
                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {alert.source ?? "unknown-source"}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-slate-300">{alert.asset_name ?? "-"}</td>
                      <td className="px-4 py-3 align-top text-slate-400">
                        {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={alert.status} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                          {alert.status === "new" ? (
                            <button
                              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300 disabled:opacity-50"
                              disabled={pendingForRow}
                              onClick={() =>
                                runAction(
                                  `ack:${alert.id}`,
                                  () => acknowledgeAlertAction(alert.id),
                                  "Alert acknowledged.",
                                  () => setSelectedIds((current) => current.filter((id) => id !== alert.id)),
                                )
                              }
                              type="button"
                            >
                              Acknowledge
                            </button>
                          ) : null}
                          {alert.status !== "resolved" && alert.status !== "suppressed" ? (
                            <button
                              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-green-500 hover:text-green-300 disabled:opacity-50"
                              disabled={pendingForRow}
                              onClick={() =>
                                runAction(
                                  `resolve:${alert.id}`,
                                  () => resolveAlertAction(alert.id),
                                  "Alert resolved.",
                                  () => setSelectedIds((current) => current.filter((id) => id !== alert.id)),
                                )
                              }
                              type="button"
                            >
                              Resolve
                            </button>
                          ) : null}
                          {alert.status !== "suppressed" ? (
                            <button
                              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-red-500 hover:text-red-300 disabled:opacity-50"
                              disabled={pendingForRow}
                              onClick={() =>
                                runAction(
                                  `suppress:${alert.id}`,
                                  () => suppressAlertAction(alert.id),
                                  "Alert suppressed.",
                                  () => setSelectedIds((current) => current.filter((id) => id !== alert.id)),
                                )
                              }
                              type="button"
                            >
                              Suppress
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {expandedAlertId === alert.id ? (
                      <tr key={`${alert.id}-detail`} className="bg-slate-950/40">
                        <td className="px-4 py-4" colSpan={7}>
                          <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Description</p>
                              <p className="mt-2 text-slate-200">{alert.description ?? "No description provided."}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Rule</p>
                              <p className="mt-2">{alert.rule_name ?? "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Source</p>
                              <p className="mt-2 font-mono">{alert.source ?? "-"}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Timestamps</p>
                              <div className="mt-2 space-y-1 text-slate-400">
                                <p>Triggered: {formatTimestamp(alert.triggered_at)}</p>
                                <p>Acknowledged: {formatTimestamp(alert.acknowledged_at)}</p>
                                <p>Resolved: {formatTimestamp(alert.resolved_at)}</p>
                              </div>
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

