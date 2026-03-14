import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Shield,
  Wrench,
} from "lucide-react";

const completedAreas = [
  "Next.js foundation, route tree, shared layouts, and design system shell",
  "Supabase schema, enums, RLS policies, helper SQL, and seeded preview data",
  "Authentication base: login screen, protected routing, session helpers, and test user setup",
  "Deployment configuration, security headers, environment examples, and release notes",
] as const;

const inProgressAreas = [
  "Dashboard, assets, alerts, incidents, threats, and compliance pages are visible but still shell-level in parts",
  "Current release is suitable for stakeholder preview, not full operational use",
] as const;

const pendingAreas = [
  "Backend CRUD actions and live data access for major modules",
  "API routes for external integrations and alert workflows",
  "Realtime alert badge, optimistic updates, reports, settings, and full audit experience",
  "Final production verification across deployment, RLS, and end-to-end feature flows",
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_100%)] p-8 shadow-2xl shadow-slate-950/40 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-sky-300">
                <Shield className="h-3.5 w-3.5" />
                CyberGuard OT
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
                  Stakeholder Preview Release
                </h1>
                <p className="max-w-2xl text-base text-slate-300 lg:text-lg">
                  This live snapshot shows the current implementation progress for the
                  CyberGuard OT platform. It is intended for project review,
                  stakeholder walkthroughs, and progress reporting.
                </p>
              </div>
            </div>
            <div className="grid min-w-[220px] gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                Current Status
              </p>
              <p className="text-5xl font-semibold text-sky-300">50%</p>
              <p className="text-sm text-slate-300">
                Implemented and ready for preview
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <h2 className="text-lg font-semibold text-white">Completed</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {completedAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-amber-300" />
              <h2 className="text-lg font-semibold text-white">In Progress</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {inProgressAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Wrench className="h-5 w-5 text-slate-300" />
              <h2 className="text-lg font-semibold text-white">Pending</h2>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              {pendingAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              What stakeholders can review right now
            </h2>
            <div className="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="font-medium text-white">Public Preview</p>
                <p className="mt-2">
                  The landing page summarizes implemented scope, in-progress work, and
                  the remaining delivery surface.
                </p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="font-medium text-white">Authenticated Shell</p>
                <p className="mt-2">
                  The protected app shows the current dashboard structure, navigation,
                  layout system, and preview pages for upcoming modules.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
                <LockKeyhole className="h-3.5 w-3.5" />
                Restricted App Access
              </div>
              <p className="text-sm text-slate-300">
                Sign in to view the internal dashboard preview. Demo credentials
                should be shared privately by the project owner, not exposed on the
                public page.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            >
              Open Preview Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
