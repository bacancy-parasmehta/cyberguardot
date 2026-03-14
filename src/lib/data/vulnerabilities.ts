import type {
  ActionResult,
  Asset,
  Vulnerability,
  VulnerabilityDetail,
  VulnerabilityStats,
  VulnStatus,
} from "@/types";
import { getDataContext, type DataContext } from "@/lib/data/context";
import { buildVulnerabilityStats } from "@/lib/data/stats";

const severityRank = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  informational: 4,
} as const;

function mutationError(message: string): ActionResult<never> {
  return {
    success: false,
    error: message,
  };
}

function canManageVulnerabilities(role: string): boolean {
  return role === "admin" || role === "engineer";
}

async function getAssetNameMap(
  context: DataContext,
  assetIds: string[],
): Promise<Map<string, string>> {
  if (assetIds.length === 0) {
    return new Map();
  }

  const { data } = await context.supabase
    .from("assets")
    .select("id, name")
    .eq("facility_id", context.facilityId)
    .in("id", assetIds);

  return new Map((data ?? []).map((asset: Pick<Asset, "id" | "name">) => [asset.id, asset.name]));
}

async function hydrateVulnerabilities(
  context: DataContext,
  vulnerabilities: Vulnerability[],
): Promise<Vulnerability[]> {
  const assetIds = Array.from(
    new Set(
      vulnerabilities
        .map((vulnerability) => vulnerability.asset_id)
        .filter((assetId): assetId is string => Boolean(assetId)),
    ),
  );
  const assetNameMap = await getAssetNameMap(context, assetIds);

  return [...vulnerabilities]
    .map((vulnerability) => ({
      ...vulnerability,
      asset_name: assetNameMap.get(vulnerability.asset_id) ?? undefined,
    }))
    .sort((left, right) => {
      const severityDelta = severityRank[left.severity] - severityRank[right.severity];

      if (severityDelta !== 0) {
        return severityDelta;
      }

      return right.discovered_at.localeCompare(left.discovered_at);
    });
}

async function fetchVulnerabilitiesForFacility(
  context: DataContext,
): Promise<Vulnerability[]> {
  const { data, error } = await context.supabase
    .from("vulnerabilities")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("discovered_at", { ascending: false });

  if (error) {
    return [];
  }

  return hydrateVulnerabilities(context, (data ?? []) as Vulnerability[]);
}

export async function getVulnerabilities(): Promise<Vulnerability[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  return fetchVulnerabilitiesForFacility(context);
}

export async function getVulnerabilityById(
  id: string,
): Promise<VulnerabilityDetail | null> {
  const context = await getDataContext();

  if (!context) {
    return null;
  }

  const { data: vulnerabilityData, error } = await context.supabase
    .from("vulnerabilities")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const vulnerability = (vulnerabilityData ?? null) as Vulnerability | null;

  if (error || !vulnerability) {
    return null;
  }

  const { data: assetData } = await context.supabase
    .from("assets")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", vulnerability.asset_id)
    .maybeSingle();
  const asset = (assetData ?? null) as Asset | null;

  return {
    ...vulnerability,
    asset: asset ?? undefined,
    asset_name: asset?.name ?? undefined,
  };
}

export async function getVulnerabilityStats(): Promise<VulnerabilityStats> {
  const context = await getDataContext();

  if (!context) {
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      resolved: 0,
    };
  }

  return buildVulnerabilityStats(await fetchVulnerabilitiesForFacility(context));
}

export async function updateVulnerabilityStatus(
  id: string,
  status: VulnStatus,
  _notes?: string,
): Promise<ActionResult<Vulnerability>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update vulnerabilities.");
  }

  if (!canManageVulnerabilities(context.profile.role)) {
    return mutationError("Your role does not have permission to update vulnerabilities.");
  }

  const resolvedAt = status === "resolved" ? new Date().toISOString() : null;
  const { data: vulnerabilityData, error } = await context.supabase
    .from("vulnerabilities")
    .update({
      status,
      resolved_at: resolvedAt,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const vulnerability = (vulnerabilityData ?? null) as Vulnerability | null;

  if (error || !vulnerability) {
    return mutationError(error?.message ?? "Unable to update vulnerability.");
  }

  const [hydratedVulnerability] = await hydrateVulnerabilities(context, [vulnerability]);

  return {
    success: true,
    data: hydratedVulnerability,
  };
}

export async function assignVulnerability(
  id: string,
  userId: string,
): Promise<ActionResult<Vulnerability>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to assign vulnerabilities.");
  }

  if (!canManageVulnerabilities(context.profile.role)) {
    return mutationError("Your role does not have permission to assign vulnerabilities.");
  }

  const { data: vulnerabilityData, error } = await context.supabase
    .from("vulnerabilities")
    .update({ assigned_to: userId } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const vulnerability = (vulnerabilityData ?? null) as Vulnerability | null;

  if (error || !vulnerability) {
    return mutationError(error?.message ?? "Unable to assign vulnerability.");
  }

  const [hydratedVulnerability] = await hydrateVulnerabilities(context, [vulnerability]);

  return {
    success: true,
    data: hydratedVulnerability,
  };
}
