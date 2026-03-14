import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const currentUser = await getCurrentUser();

  return (
    <section className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Phase 5D should wire profile updates, password changes, and audit log access."
      />
      <SettingsTabs profile={currentUser?.profile ?? null} />
    </section>
  );
}
