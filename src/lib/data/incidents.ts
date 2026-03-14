import type {
  ActionResult,
  Asset,
  Incident,
  IncidentDetail,
  IncidentStats,
  IncidentStatus,
  Threat,
} from "@/types";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validations";
import { getDataContext } from "@/lib/data/context";
import { buildIncidentStats } from "@/lib/data/stats";

function mutationError(message: string): ActionResult<never> {
  return {
    success: false,
    error: message,
  };
}

function canManageIncidents(role: string): boolean {
  return role === "admin" || role === "engineer";
}

async function fetchIncidentsForFacility(): Promise<Incident[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("incidents")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("opened_at", { ascending: false });

  if (error) {
    return [];
  }

  return (data ?? []) as Incident[];
}

async function getIncidentForMutation(id: string): Promise<Incident | null> {
  const context = await getDataContext();

  if (!context) {
    return null;
  }

  const { data, error } = await context.supabase
    .from("incidents")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const incident = (data ?? null) as Incident | null;

  if (error || !incident) {
    return null;
  }

  return incident;
}

export async function getIncidents(): Promise<Incident[]> {
  return fetchIncidentsForFacility();
}

export async function getIncidentById(
  id: string,
): Promise<IncidentDetail | null> {
  const context = await getDataContext();

  if (!context) {
    return null;
  }

  const { data: incidentData, error } = await context.supabase
    .from("incidents")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const incident = (incidentData ?? null) as Incident | null;

  if (error || !incident) {
    return null;
  }

  const threatIds = incident.related_threat_ids ?? [];
  const assetIds = incident.related_asset_ids ?? [];
  const [relatedThreatsResult, relatedAssetsResult] = await Promise.all([
    threatIds.length > 0
      ? context.supabase
          .from("threats")
          .select("*")
          .eq("facility_id", context.facilityId)
          .in("id", threatIds)
      : Promise.resolve({ data: [] as Threat[] }),
    assetIds.length > 0
      ? context.supabase
          .from("assets")
          .select("*")
          .eq("facility_id", context.facilityId)
          .in("id", assetIds)
      : Promise.resolve({ data: [] as Asset[] }),
  ]);

  return {
    ...incident,
    related_threats: (relatedThreatsResult.data ?? []) as Threat[],
    related_assets: (relatedAssetsResult.data ?? []) as Asset[],
  };
}

export async function getIncidentStats(): Promise<IncidentStats> {
  return buildIncidentStats(await fetchIncidentsForFacility());
}

export async function createIncident(
  data: CreateIncidentInput,
): Promise<ActionResult<Incident>> {
  const parsed = createIncidentSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid incident payload.",
    };
  }

  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to create incidents.");
  }

  if (!canManageIncidents(context.profile.role)) {
    return mutationError("Your role does not have permission to create incidents.");
  }

  const createdAt = new Date().toISOString();
  const { data: incidentData, error } = await context.supabase
    .from("incidents")
    .insert({
      facility_id: context.facilityId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      severity: parsed.data.severity,
      status: parsed.data.status,
      assigned_to: parsed.data.assigned_to || null,
      related_threat_ids: parsed.data.related_threat_ids,
      related_asset_ids: parsed.data.related_asset_ids,
      timeline: [
        {
          timestamp: createdAt,
          action: "incident_created",
          user_id: context.userId,
          note: "Incident created.",
        },
      ],
      created_by: context.userId,
      opened_at: createdAt,
    } as never)
    .select("*")
    .single();
  const incident = (incidentData ?? null) as Incident | null;

  if (error || !incident) {
    return mutationError(error?.message ?? "Unable to create incident.");
  }

  return {
    success: true,
    data: incident,
  };
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentStatus,
): Promise<ActionResult<Incident>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update incidents.");
  }

  if (!canManageIncidents(context.profile.role)) {
    return mutationError("Your role does not have permission to update incidents.");
  }

  const incident = await getIncidentForMutation(id);

  if (!incident) {
    return mutationError("Incident not found.");
  }

  const resolvedAt =
    status === "resolved" || status === "closed" ? new Date().toISOString() : null;
  const nextTimeline = [
    ...(incident.timeline ?? []),
    {
      timestamp: new Date().toISOString(),
      action: "status_changed",
      user_id: context.userId,
      note: `Incident moved to ${status.replaceAll("_", " ")}.`,
    },
  ];
  const { data: incidentData, error } = await context.supabase
    .from("incidents")
    .update({
      status,
      resolved_at: resolvedAt,
      timeline: nextTimeline,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const updatedIncident = (incidentData ?? null) as Incident | null;

  if (error || !updatedIncident) {
    return mutationError(error?.message ?? "Unable to update incident.");
  }

  return {
    success: true,
    data: updatedIncident,
  };
}

export async function addIncidentTimelineEntry(
  id: string,
  note: string,
): Promise<ActionResult<Incident>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update incidents.");
  }

  if (!canManageIncidents(context.profile.role)) {
    return mutationError("Your role does not have permission to update incidents.");
  }

  const incident = await getIncidentForMutation(id);

  if (!incident) {
    return mutationError("Incident not found.");
  }

  const nextTimeline = [
    ...(incident.timeline ?? []),
    {
      timestamp: new Date().toISOString(),
      action: "note_added",
      user_id: context.userId,
      note,
    },
  ];
  const { data: incidentData, error } = await context.supabase
    .from("incidents")
    .update({ timeline: nextTimeline } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const updatedIncident = (incidentData ?? null) as Incident | null;

  if (error || !updatedIncident) {
    return mutationError(error?.message ?? "Unable to update incident timeline.");
  }

  return {
    success: true,
    data: updatedIncident,
  };
}

export async function assignIncident(
  id: string,
  userId: string,
): Promise<ActionResult<Incident>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to assign incidents.");
  }

  if (!canManageIncidents(context.profile.role)) {
    return mutationError("Your role does not have permission to assign incidents.");
  }

  const incident = await getIncidentForMutation(id);

  if (!incident) {
    return mutationError("Incident not found.");
  }

  const nextTimeline = [
    ...(incident.timeline ?? []),
    {
      timestamp: new Date().toISOString(),
      action: "assignee_changed",
      user_id: context.userId,
      note: `Assigned to ${userId}.`,
    },
  ];
  const { data: incidentData, error } = await context.supabase
    .from("incidents")
    .update({ assigned_to: userId, timeline: nextTimeline } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const updatedIncident = (incidentData ?? null) as Incident | null;

  if (error || !updatedIncident) {
    return mutationError(error?.message ?? "Unable to assign incident.");
  }

  return {
    success: true,
    data: updatedIncident,
  };
}
