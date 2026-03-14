"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  addIncidentTimelineEntryAction,
  assignIncidentToMeAction,
  updateIncidentStatusAction,
} from "@/app/(dashboard)/incidents/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { IncidentDetail, IncidentStatus } from "@/types";

const incidentTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  open: ["investigating", "contained"],
  investigating: ["contained", "resolved"],
  contained: ["resolved"],
  resolved: ["closed"],
  closed: [],
};
const statusActionLabels: Record<IncidentStatus, string> = {
  open: "Open",
  investigating: "Investigate",
  contained: "Contain",
  resolved: "Resolve",
  closed: "Close",
};

function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function initialsFromName(value: string | null | undefined): string {
  if (!value) {
    return "U";
  }

  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

export function IncidentDetailClient({ incident }: { incident: IncidentDetail }) {
  const [timelineNote, setTimelineNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const sortedTimeline = [...(incident.timeline ?? [])].sort(
    (left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp),
  );

  function runAction(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    startTransition(() => {
      void action()
        .then((result) => {
          if (!result.success) {
            toast.error(result.error ?? "Incident action failed.");
            return;
          }

          toast.success(successMessage);
          onSuccess?.();
          router.refresh();
        })
        .catch(() => {
          toast.error("Incident action failed.");
        });
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={incident.title}
        subtitle="Manage containment, note-taking, and ownership from the incident workspace."
        actions={
          <Link
            className="inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300"
            href="/incidents"
          >
            Back to Incidents
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <RiskBadge level={incident.severity} />
        <StatusBadge status={incident.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Update Status</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Only valid next states are available from the current incident status.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {incidentTransitions[incident.status].map((nextStatus) => (
                  <button
                    key={nextStatus}
                    className={
                      nextStatus === "resolved" || nextStatus === "closed"
                        ? "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-green-500 hover:text-green-300 disabled:opacity-50"
                        : nextStatus === "contained"
                          ? "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300 disabled:opacity-50"
                          : "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-amber-500 hover:text-amber-300 disabled:opacity-50"
                    }
                    disabled={isPending}
                    onClick={() =>
                      runAction(
                        () => updateIncidentStatusAction(incident.id, nextStatus),
                        `Incident moved to ${nextStatus.replaceAll("_", " ")}.`,
                      )
                    }
                    type="button"
                  >
                    {statusActionLabels[nextStatus]}
                  </button>
                ))}
                {incidentTransitions[incident.status].length === 0 ? (
                  <span className="inline-flex items-center rounded-lg border border-slate-800 px-4 py-2 text-sm text-slate-500">
                    No further transitions
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Timeline</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Newest entries first, including automated status transitions and analyst notes.
                </p>
              </div>
              <div className="w-full max-w-xl space-y-3 lg:min-w-[340px]">
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                  onChange={(event) => setTimelineNote(event.target.value)}
                  placeholder="Add investigation notes, containment steps, or handoff context"
                  value={timelineNote}
                />
                <button
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  disabled={isPending}
                  onClick={() =>
                    runAction(
                      () => addIncidentTimelineEntryAction(incident.id, timelineNote),
                      "Timeline entry added.",
                      () => setTimelineNote(""),
                    )
                  }
                  type="button"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {sortedTimeline.length === 0 ? (
                <EmptyState
                  title="No timeline entries yet"
                  description="Timeline notes will appear here as the response workflow progresses."
                />
              ) : (
                sortedTimeline.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="mt-1 h-3 w-3 rounded-full bg-sky-400" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                        <span>{formatDateTime(entry.timestamp)}</span>
                        <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                          {entry.user_name ?? "System"}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-white">
                        {entry.action.replaceAll("_", " ")}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">{entry.note}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Description</h2>
            <p className="mt-3 text-sm text-slate-300">
              {incident.description ?? "No incident description has been recorded yet."}
            </p>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Root Cause & Resolution</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Root Cause</p>
                <p className="mt-3 text-sm text-slate-300">
                  {incident.root_cause ?? "Not determined yet."}
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Resolution</p>
                <p className="mt-3 text-sm text-slate-300">
                  {incident.resolution ?? "No remediation outcome recorded yet."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Incident Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Severity</dt>
                <dd><RiskBadge level={incident.severity} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Status</dt>
                <dd><StatusBadge status={incident.status} /></dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Created By</dt>
                <dd className="text-right text-slate-200">{incident.creator_name ?? "System"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Opened</dt>
                <dd className="text-right text-slate-200">{formatDateTime(incident.opened_at)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Resolved</dt>
                <dd className="text-right text-slate-200">{formatDateTime(incident.resolved_at)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Assigned To</h2>
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-sm font-semibold text-sky-300">
                {initialsFromName(incident.assignee_name)}
              </div>
              <div>
                <p className="font-medium text-white">{incident.assignee_name ?? "Unassigned"}</p>
                <p className="mt-1 text-sm text-slate-400">Current ownership for the active response.</p>
              </div>
            </div>
            <button
              className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300 disabled:opacity-50"
              disabled={isPending}
              onClick={() =>
                runAction(
                  () => assignIncidentToMeAction(incident.id),
                  "Incident assigned to you.",
                )
              }
              type="button"
            >
              Assign to Me
            </button>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-white">Related</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-slate-400">Related Threats</p>
                {incident.related_threats && incident.related_threats.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-slate-200">
                    {incident.related_threats.map((threat) => (
                      <li key={threat.id}>
                        <Link className="hover:text-sky-300" href="/threats">
                          {threat.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-slate-500">0 related threats</p>
                )}
              </div>
              <div>
                <p className="text-slate-400">Related Assets</p>
                {incident.related_assets && incident.related_assets.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-slate-200">
                    {incident.related_assets.map((asset) => (
                      <li key={asset.id}>
                        <Link className="hover:text-sky-300" href={`/assets/${asset.id}`}>
                          {asset.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-slate-500">0 related assets</p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}