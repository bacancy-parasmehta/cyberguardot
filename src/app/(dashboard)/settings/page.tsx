import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/auth";
import { getAuditLogs } from "@/lib/data/audit";

export default async function SettingsPage() {
  const [currentUser, auditLogs] = await Promise.all([getCurrentUser(), getAuditLogs()]);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage profile details, password, session scope, notifications, and audit visibility."
      />
      <SettingsTabs profile={currentUser?.profile ?? null} auditLogs={auditLogs} />
    </section>
  );
}
