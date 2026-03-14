import { PageHeader } from "@/components/ui/PageHeader";

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="space-y-6">
      <PageHeader
        title={`Asset ${params.id}`}
        subtitle="Phase 5B should replace this placeholder with asset details, related vulnerabilities, and recent alerts."
      />
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-sm text-slate-400">
        Asset detail route scaffold.
      </div>
    </section>
  );
}
