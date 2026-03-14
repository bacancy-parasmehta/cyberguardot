import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth";
import { appMeta } from "@/lib/constants";
import type { UserRole } from "@/types";
import { RoleBadge } from "@/components/layout/RoleBadge";

export function Header({
  userName,
  role,
}: {
  userName: string;
  role: UserRole;
}) {
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-lg shadow-slate-950/30 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-slate-400">{appMeta.name}</p>
        <h1 className="text-lg font-semibold text-white">Dashboard Workspace</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-white">{userName}</p>
          <p className="text-xs text-slate-400">Authenticated session</p>
        </div>
        <RoleBadge role={role} />
        <form action={signOut}>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
