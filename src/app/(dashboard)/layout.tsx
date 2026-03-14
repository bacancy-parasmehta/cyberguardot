import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentUser = await requireAuth();
  const userName =
    currentUser.profile?.full_name ?? currentUser.user.email ?? "Authenticated User";
  const role = currentUser.profile?.role ?? "analyst";

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 lg:px-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar />
        <div className="space-y-4 lg:min-w-0">
          <Header role={role} userName={userName} />
          <Breadcrumbs />
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
