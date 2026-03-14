export default function RootLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-10 rounded-lg bg-slate-900" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-32 rounded-xl bg-slate-900" />
          <div className="h-32 rounded-xl bg-slate-900" />
          <div className="h-32 rounded-xl bg-slate-900" />
          <div className="h-32 rounded-xl bg-slate-900" />
        </div>
      </div>
    </div>
  );
}