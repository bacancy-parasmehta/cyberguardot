export const revalidate = 60;

export default function ReportsPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold text-white">Reports</h1>
        <p className="mt-3 text-sm text-slate-400">
          Phase 5D should add report generation, JSON and CSV export, and saved-report placeholders here.
        </p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
        PDF export is intentionally deferred for the MVP.
      </div>
    </section>
  );
}
