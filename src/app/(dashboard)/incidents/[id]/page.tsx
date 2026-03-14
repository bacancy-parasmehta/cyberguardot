import { PageHeader } from "@/components/ui/PageHeader";

export default function IncidentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <section className="space-y-6">
      <PageHeader
        title={`Incident ${params.id}`}
        subtitle="Phase 5C should replace this placeholder with status transitions, timeline notes, and assignment controls."
      />
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
        Incident detail route scaffold.
      </div>
    </section>
  );
}
