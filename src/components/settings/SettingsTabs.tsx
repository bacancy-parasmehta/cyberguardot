"use client";

import { useState } from "react";

import type { Profile } from "@/types";

const tabs = ["Profile", "Security", "Notifications", "Audit Log"] as const;

export function SettingsTabs({ profile }: { profile: Profile | null }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Profile");

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
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <p className="text-sm text-slate-400">
              Name: {profile?.full_name ?? "Pending profile wiring"}
            </p>
            <p className="text-sm text-slate-400">
              Email: {profile?.email ?? "Pending auth wiring"}
            </p>
          </div>
        ) : null}
        {activeTab === "Security" ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Security</h2>
            <p className="text-sm text-slate-400">
              Password change and session management should be wired during Phase 5D.
            </p>
          </div>
        ) : null}
        {activeTab === "Notifications" ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <p className="text-sm text-slate-400">
              Notification toggles are planned as UI-only controls for the MVP.
            </p>
          </div>
        ) : null}
        {activeTab === "Audit Log" ? (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Audit Log</h2>
            <p className="text-sm text-slate-400">
              Read-only audit log rendering belongs in Phase 6.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

