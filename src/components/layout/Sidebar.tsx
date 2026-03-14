"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  ClipboardCheck,
  FileText,
  Flame,
  LayoutDashboard,
  Menu,
  type LucideIcon,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  X,
} from "lucide-react";

import { dashboardNavigation } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<(typeof dashboardNavigation)[number]["icon"], LucideIcon> = {
  LayoutDashboard,
  Server,
  ShieldAlert,
  AlertTriangle,
  Flame,
  Bell,
  ClipboardCheck,
  FileText,
  Settings,
};

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ initialNewAlertCount = 0 }: { initialNewAlertCount?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [newAlertCount, setNewAlertCount] = useState(initialNewAlertCount);

  useEffect(() => {
    let cancelled = false;

    async function refreshAlertCount() {
      try {
        const response = await fetch("/api/alerts?summary=true", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { stats?: { new?: number } };

        if (!cancelled && typeof payload.stats?.new === "number") {
          setNewAlertCount(payload.stats.new);
        }
      } catch {
        // Ignore polling failures and keep the last known count.
      }
    }

    void refreshAlertCount();
    const intervalId = window.setInterval(() => {
      void refreshAlertCount();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const navContent = (
    <>
      <div className="mb-8 flex items-center gap-3 border-b border-slate-800 pb-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-500/30 bg-sky-500/10 text-sky-300">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sky-400">CyberGuard</p>
          <h2 className="mt-1 text-lg font-semibold text-white">OT Console</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {dashboardNavigation.map((item) => {
          const Icon = iconMap[item.icon];
          const active = isActivePath(pathname, item.href);
          const showBadge = item.href === "/alerts" && newAlertCount > 0;

          return (
            <Link
              key={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-slate-800 px-3 py-3 text-sm transition",
                active
                  ? "border-l-2 border-l-sky-500 bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
              )}
              href={item.href}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {showBadge ? (
                <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-300">
                  {newAlertCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <button
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-100 shadow-lg shadow-slate-950/40 lg:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/75 transition lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-slate-950/40 transition-transform lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex justify-end">
          <button
            aria-label="Close navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-slate-200"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navContent}
      </aside>

      <aside className="hidden w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/30 lg:block">
        {navContent}
      </aside>
    </>
  );
}