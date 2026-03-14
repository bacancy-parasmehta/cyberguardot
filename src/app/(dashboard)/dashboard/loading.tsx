export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 rounded-lg bg-slate-900" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 rounded-xl bg-slate-900" />
        <div className="h-32 rounded-xl bg-slate-900" />
        <div className="h-32 rounded-xl bg-slate-900" />
        <div className="h-32 rounded-xl bg-slate-900" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-64 rounded-xl bg-slate-900" />
        <div className="h-64 rounded-xl bg-slate-900" />
      </div>
    </div>
  );
}