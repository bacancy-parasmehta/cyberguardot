"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { changePasswordAction, signOutOtherSessionsAction, updateProfileAction } from "@/app/(dashboard)/settings/actions";
import { RoleBadge } from "@/components/layout/RoleBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AuditLog, Profile } from "@/types";

const tabs = ["Profile", "Security", "Notifications", "Audit Log"] as const;

function stringifyAuditDetails(log: AuditLog): string {
  const previous = log.old_values ? JSON.stringify(log.old_values) : "-";
  const next = log.new_values ? JSON.stringify(log.new_values) : "-";
  const compact = `${previous} -> ${next}`;

  return compact.length > 140 ? `${compact.slice(0, 137)}...` : compact;
}

export function SettingsTabs({
  profile,
  auditLogs,
}: {
  profile: Profile | null;
  auditLogs: AuditLog[];
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Profile");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function runAction<T extends { success: boolean; error?: string }>(
    action: () => Promise<T>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    startTransition(() => {
      void action()
        .then((result) => {
          if (!result.success) {
            toast.error(result.error ?? "Action failed.");
            return;
          }

          toast.success(successMessage);
          onSuccess?.();
        })
        .catch(() => {
          toast.error("Action failed.");
        });
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300"
            }
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        {activeTab === "Profile" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="mt-2 text-sm text-slate-400">Update your display information for the OT workspace.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="text-sm text-slate-300">
                Full Name
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
              <label className="text-sm text-slate-300">
                Email
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-slate-400"
                  disabled
                  value={profile?.email ?? ""}
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-400">Role</span>
              {profile ? <RoleBadge role={profile.role} /> : null}
            </div>
            <button
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
              disabled={isPending}
              onClick={() => runAction(() => updateProfileAction(fullName), "Profile updated.")}
              type="button"
            >
              Save Profile
            </button>
          </div>
        ) : null}
        {activeTab === "Security" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="mt-2 text-sm text-slate-400">Rotate your password and manage active sessions.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="text-sm text-slate-300">
                Current Password
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
              </label>
              <label className="text-sm text-slate-300">
                New Password
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </label>
              <label className="text-sm text-slate-300">
                Confirm New Password
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-sky-500"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>
            </div>
            <button
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
              disabled={isPending}
              onClick={() => {
                if (newPassword !== confirmPassword) {
                  toast.error("New password and confirmation do not match.");
                  return;
                }

                runAction(
                  () => changePasswordAction(currentPassword, newPassword),
                  "Password updated.",
                  () => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  },
                );
              }}
              type="button"
            >
              Change Password
            </button>
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h3 className="font-medium text-white">Active Sessions</h3>
              <p className="mt-2 text-sm text-slate-400">1 active session - Current Device</p>
              <button
                className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-60"
                disabled={isPending}
                onClick={() =>
                  runAction(
                    () => signOutOtherSessionsAction(),
                    "Other sessions signed out.",
                  )
                }
                type="button"
              >
                Sign out all other devices
              </button>
            </div>
          </div>
        ) : null}
        {activeTab === "Notifications" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Notifications</h2>
              <p className="mt-2 text-sm text-slate-400">Static preview of upcoming notification preferences.</p>
            </div>
            <div className="space-y-4">
              {[
                ["Critical Alerts", "Email notification", true],
                ["High Severity Incidents", "Email notification", true],
                ["Weekly Summary Report", "Email notification", true],
                ["New Vulnerabilities", "In-app notification", true],
              ].map(([label, description, checked]) => (
                <div
                  key={String(label)}
                  className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{label}</p>
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                  </div>
                  <label className="relative inline-flex h-6 w-12 cursor-default rounded-full bg-sky-500/70 p-1">
                    <input checked={Boolean(checked)} className="sr-only" readOnly type="checkbox" />
                    <span className="block h-4 w-4 translate-x-6 rounded-full bg-white" />
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">Notification preferences available in upcoming release.</p>
          </div>
        ) : null}
        {activeTab === "Audit Log" ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Audit Log</h2>
              <p className="mt-2 text-sm text-slate-400">Recent read-only activity for this facility.</p>
            </div>
            {auditLogs.length === 0 ? (
              <EmptyState
                title="No audit entries yet"
                description="Audit records will appear here as profile, incident, threat, and compliance actions are performed."
              />
            ) : (
              <div className="max-h-[460px] overflow-auto rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-950/70 text-left text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Entity</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-white">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-4 py-3 align-top text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 align-top">{log.user_name ?? "System"}</td>
                        <td className="px-4 py-3 align-top">{log.action.replaceAll("_", " ")}</td>
                        <td className="px-4 py-3 align-top text-slate-300">
                          {log.entity_type ?? "-"}
                        </td>
                        <td className="px-4 py-3 align-top text-slate-400">{stringifyAuditDetails(log)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
