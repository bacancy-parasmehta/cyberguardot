import type {
  ActionResult,
  Asset,
  Threat,
  ThreatDetail,
  ThreatStats,
  ThreatStatus,
} from "@/types";
import { createThreatSchema, type CreateThreatInput } from "@/lib/validations";
import { getDataContext } from "@/lib/data/context";
import { buildThreatStats } from "@/lib/data/stats";

const threatTransitions: Record<ThreatStatus, ThreatStatus[]> = {
  active: ["investigating", "contained", "resolved"],
  investigating: ["contained", "resolved"],
  contained: ["resolved"],
  resolved: [],
};

function mutationError(message: string): ActionResult<never> {
  return {
    success: false,
    error: message,
  };
}

function canManageThreats(role: string): boolean {
  return role === "admin" || role === "engineer";
}

async function hydrateThreats(
  threats: Threat[],
): Promise<Threat[]> {
  const context = await getDataContext();

  if (!context || threats.length === 0) {
    return threats;
  }

  const assetIds = Array.from(
    new Set(threats.flatMap((threat) => threat.affected_asset_ids ?? [])),
  );

  if (assetIds.length === 0) {
    return threats;
  }

  const { data } = await context.supabase
    .from("assets")
    .select("id, name")
    .eq("facility_id", context.facilityId)
    .in("id", assetIds);
  const assetMap = new Map(
    (data ?? []).map((asset: Pick<Asset, "id" | "name">) => [asset.id, asset.name]),
  );

  return threats.map((threat) => ({
    ...threat,
    affected_asset_names: threat.affected_asset_ids.map(
      (assetId) => assetMap.get(assetId) ?? assetId,
    ),
  }));
}

async function fetchThreatsForFacility(): Promise<Threat[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("threats")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("detected_at", { ascending: false });

  if (error) {
    return [];
  }

  return hydrateThreats((data ?? []) as Threat[]);
}

export async function getThreats(): Promise<Threat[]> {
  return fetchThreatsForFacility();
}

export async function getThreatById(id: string): Promise<ThreatDetail | null> {
  const context = await getDataContext();

  if (!context) {
    return null;
  }

  const { data: threatData, error } = await context.supabase
    .from("threats")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const threat = (threatData ?? null) as Threat | null;

  if (error || !threat) {
    return null;
  }

  const assetIds = threat.affected_asset_ids ?? [];
  let affectedAssets: Asset[] = [];

  if (assetIds.length > 0) {
    const { data } = await context.supabase
      .from("assets")
      .select("*")
      .eq("facility_id", context.facilityId)
      .in("id", assetIds);

    affectedAssets = (data ?? []) as Asset[];
  }

  const [hydratedThreat] = await hydrateThreats([threat]);

  return {
    ...hydratedThreat,
    affected_assets: affectedAssets,
  };
}

export async function getThreatStats(): Promise<ThreatStats> {
  return buildThreatStats(await fetchThreatsForFacility());
}

export async function updateThreatStatus(
  id: string,
  status: ThreatStatus,
): Promise<ActionResult<Threat>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update threats.");
  }

  if (!canManageThreats(context.profile.role)) {
    return mutationError("Your role does not have permission to update threats.");
  }

  const { data: currentThreatData } = await context.supabase
    .from("threats")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const currentThreat = (currentThreatData ?? null) as Threat | null;

  if (!currentThreat) {
    return mutationError("Threat not found.");
  }

  if (!threatTransitions[currentThreat.status].includes(status)) {
    return mutationError(`Threat cannot move from ${currentThreat.status} to ${status}.`);
  }

  const { data: threatData, error } = await context.supabase
    .from("threats")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const threat = (threatData ?? null) as Threat | null;

  if (error || !threat) {
    return mutationError(error?.message ?? "Unable to update threat.");
  }

  const [hydratedThreat] = await hydrateThreats([threat]);

  return {
    success: true,
    data: hydratedThreat,
  };
}

export async function createThreat(
  data: CreateThreatInput,
): Promise<ActionResult<Threat>> {
  const parsed = createThreatSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid threat payload.",
    };
  }

  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to create threats.");
  }

  if (!canManageThreats(context.profile.role)) {
    return mutationError("Your role does not have permission to create threats.");
  }

  const { data: threatData, error } = await context.supabase
    .from("threats")
    .insert({
      facility_id: context.facilityId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      threat_type: parsed.data.threat_type || null,
      status: parsed.data.status,
      severity: parsed.data.severity,
      source_ip: parsed.data.source_ip || null,
      destination_ip: parsed.data.destination_ip || null,
      affected_asset_ids: parsed.data.affected_asset_ids,
      protocol: parsed.data.protocol || null,
      mitre_tactic: parsed.data.mitre_tactic || null,
      mitre_technique: parsed.data.mitre_technique || null,
      raw_evidence: {},
    } as never)
    .select("*")
    .single();
  const threat = (threatData ?? null) as Threat | null;

  if (error || !threat) {
    return mutationError(error?.message ?? "Unable to create threat.");
  }

  const [hydratedThreat] = await hydrateThreats([threat]);

  return {
    success: true,
    data: hydratedThreat,
  };
}

export function getAllowedThreatTransitions(status: ThreatStatus): ThreatStatus[] {
  return threatTransitions[status];
}
