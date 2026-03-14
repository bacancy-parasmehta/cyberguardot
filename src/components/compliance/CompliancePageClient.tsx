"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateControlStatusAction } from "@/app/(dashboard)/compliance/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  complianceFrameworkValues,
  complianceStatusValues,
  type ComplianceControl,
  type ComplianceSummary,
} from "@/types";

const frameworkOptions = [
  { label: "All frameworks", value: "all" },
  ...complianceFrameworkValues.map((value) => ({
    label: value.replaceAll("_", " ").toUpperCase(),
    value,
  })),
];
const statusOptions = [
  { label: "All statuses", value: "all" },
  ...complianceStatusValues.map((value) => ({
    label: value.replaceAll("_", " ").replace(/^./, (char) => char.toUpperCase()),
    value,
  })),
];

function formatFrameworkLabel(value: string): string {
  return value.replaceAll("_", " ").toUpperCase();
}

function isPastDue(value: string | null): boolean {
  if (!value) {
    return false;
  }

  return new Date(value).getTime() < Date.now();
}

export function CompliancePageClient({
  controls,
  summary,
}: {
  controls: ComplianceControl[];
  summary: ComplianceSummary[];
}) {
  const [framework, setFramework] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedControlId, setExpandedControlId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<ComplianceControl["status"]>("partial");
  const [evidence, setEvidence] = useState("");
  const [pendingControlId, setPendingControlId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredControls = controls.filter((control) => {
    const haystack = `${control.control_id} ${control.control_name}`.toLowerCase();
    const matchesFramework = framework === "all" || control.framework === framework;
    const matchesStatus = status === "all" || control.status === status;
    const matchesSearch = search.trim().length === 0 || haystack.includes(search.toLowerCase());

    return matchesFramework && matchesStatus && matchesSearch;
  });

  function openUpdateForm(control: ComplianceControl) {
    setExpandedControlId((current) => (current === control.id ? null : control.id));
    setDraftStatus(control.status);
    setEvidence(control.evidence ?? "");
  }

  function saveControlUpdate(controlId: string) {
    startTransition(() => {
      setPendingControlId(controlId);
      void updateControlStatusAction(controlId, draftStatus, evidence)
        .then((result) => {
          if (!result.success) {
            toast.error(result.error ?? "Control update failed.");
            return;
          }

          toast.success("Control status updated.");
          setExpandedControlId(null);
          router.refresh();
        })
        .catch(() => {
          toast.error("Control update failed.");
        })
        .finally(() => {
          setPendingControlId(null);
        });
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Compliance"
        subtitle="Track framework performance, overdue controls, and evidence capture from one workspace."
      />
      {summary.length === 0 ? (
        <EmptyState
          title="No controls configured"
          description="Compliance scorecards will appear here once controls are loaded for this facility."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => {
            const compliantWidth = item.total > 0 ? (item.compliant / item.total) * 100 : 0;
            const partialWidth = item.total > 0 ? (item.partial / item.total) * 100 : 0;
            const nonCompliantWidth = item.total > 0 ? (item.non_compliant / item.total) * 100 : 0;
            const notApplicableWidth = item.total > 0 ? (item.not_applicable / item.total) * 100 : 0;

            return (
              <div key={item.framework} className="rounded-xl border border-slate-700 bg-slate-900 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">{formatFrameworkLabel(item.framework)}</p>
                    <p className="mt-3 text-3xl font-bold text-white">{item.score_percent}%</p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                    {item.total} controls
                  </span>
                </div>
                <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="bg-green-500" style={{ width: `${compliantWidth}%` }} />
                  <div className="bg-amber-500" style={{ width: `${partialWidth}%` }} />
                  <div className="bg-red-500" style={{ width: `${nonCompliantWidth}%` }} />
                  <div className="bg-slate-500" style={{ width: `${notApplicableWidth}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <p>Compliant: {item.compliant}</p>
                  <p>Partial: {item.partial}</p>
                  <p>Non-compliant: {item.non_compliant}</p>
                  <p>Not applicable: {item.not_applicable}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <FilterSelect value={framework} options={frameworkOptions} onChange={setFramework} />
          <FilterSelect value={status} options={statusOptions} onChange={setStatus} />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search control ID or control name"
          />
        </div>
      </div>

      {controls.length === 0 ? null : filteredControls.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
          No controls match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Control ID</th>
                <th className="px-4 py-3 font-medium">Control Name</th>
                <th className="px-4 py-3 font-medium">Framework</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last Assessed</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-white">
              {filteredControls.map((control) => {
                const isExpanded = expandedControlId === control.id;
                const isControlPending = isPending && pendingControlId === control.id;
                const dueDatePast = isPastDue(control.due_date);

                return (
                  <Fragment key={control.id}>
                    <tr className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 align-top font-mono text-xs text-slate-300">
                        {control.control_id}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-medium">{control.control_name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {control.description ?? "No control description provided."}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                          {formatFrameworkLabel(control.framework)}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge status={control.status} />
                      </td>
                      <td className="px-4 py-3 align-top text-slate-400">
                        {control.last_assessed_at
                          ? new Date(control.last_assessed_at).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className={`px-4 py-3 align-top ${dueDatePast ? "text-red-300" : "text-slate-400"}`}>
                        {control.due_date ? new Date(control.due_date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <button
                          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-sky-500 hover:text-sky-300"
                          onClick={() => openUpdateForm(control)}
                          type="button"
                        >
                          {isExpanded ? "Close" : "Update Status"}
                        </button>
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="bg-slate-950/40">
                        <td className="px-4 py-4" colSpan={7}>
                          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end">
                            <label className="text-sm text-slate-300">
                              Status
                              <select
                                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500"
                                onChange={(event) => setDraftStatus(event.target.value as ComplianceControl["status"])}
                                value={draftStatus}
                              >
                                {complianceStatusValues.map((option) => (
                                  <option key={option} value={option}>
                                    {option.replaceAll("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-sm text-slate-300">
                              Evidence
                              <textarea
                                className="mt-2 min-h-24 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-sky-500"
                                onChange={(event) => setEvidence(event.target.value)}
                                placeholder="Capture evidence, validation notes, or assessor comments"
                                value={evidence}
                              />
                            </label>
                            <button
                              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                              disabled={isControlPending}
                              onClick={() => saveControlUpdate(control.id)}
                              type="button"
                            >
                              Save
                            </button>
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