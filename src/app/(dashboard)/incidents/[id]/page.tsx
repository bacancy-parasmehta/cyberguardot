import { notFound } from "next/navigation";

import { IncidentDetailClient } from "@/components/incidents/IncidentDetailClient";
import { getIncidentById } from "@/lib/data/incidents";

export default async function IncidentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const incident = await getIncidentById(params.id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailClient incident={incident} />;
}