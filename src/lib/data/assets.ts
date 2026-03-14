import type { ActionResult, Alert, Asset, AssetDetail, AssetStats } from "@/types";
import {
  createAssetSchema,
  updateAssetSchema,
  type CreateAssetInput,
  type UpdateAssetInput,
} from "@/lib/validations";
import { getDataContext } from "@/lib/data/context";
import { buildAssetStats } from "@/lib/data/stats";

function validationError(message: string): ActionResult<never> {
  return { success: false, error: message };
}

function canManageAssets(role: string): boolean {
  return role === "admin" || role === "engineer";
}

async function fetchAssetsForFacility(): Promise<Asset[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("assets")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("risk_score", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []) as Asset[];
}

export async function getAssets(): Promise<Asset[]> {
  return fetchAssetsForFacility();
}

export async function getAssetById(id: string): Promise<AssetDetail | null> {
  const context = await getDataContext();

  if (!context) {
    return null;
  }

  const { data: assetData, error } = await context.supabase
    .from("assets")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();
  const asset = (assetData ?? null) as Asset | null;

  if (error || !asset) {
    return null;
  }

  const [{ data: vulnerabilities }, { data: recentAlerts }] = await Promise.all([
    context.supabase
      .from("vulnerabilities")
      .select("id")
      .eq("facility_id", context.facilityId)
      .eq("asset_id", id),
    context.supabase
      .from("alerts")
      .select("*")
      .eq("facility_id", context.facilityId)
      .eq("asset_id", id)
      .order("triggered_at", { ascending: false })
      .limit(5),
  ]);
  const vulnerabilityRows = (vulnerabilities ?? []) as Array<{ id: string }>;
  const recentAlertRows = (recentAlerts ?? []) as Alert[];

  return {
    ...asset,
    vulnerabilities_count: vulnerabilityRows.length,
    recent_alerts: recentAlertRows.map((alert) => ({
      ...alert,
      asset_name: asset.name,
    })),
  };
}

export async function getAssetStats(): Promise<AssetStats> {
  return buildAssetStats(await fetchAssetsForFacility());
}

export async function createAsset(data: CreateAssetInput): Promise<ActionResult<Asset>> {
  const parsed = createAssetSchema.safeParse(data);

  if (!parsed.success) {
    return validationError("Invalid asset payload.");
  }

  const context = await getDataContext();

  if (!context) {
    return validationError("You must be signed in to create assets.");
  }

  if (!canManageAssets(context.profile.role)) {
    return validationError("Your role does not have permission to create assets.");
  }

  const { data: assetData, error } = await context.supabase
    .from("assets")
    .insert({
      facility_id: context.facilityId,
      name: parsed.data.name,
      asset_type: parsed.data.asset_type,
      status: parsed.data.status,
      ip_address: parsed.data.ip_address || null,
      mac_address: parsed.data.mac_address || null,
      manufacturer: parsed.data.manufacturer || null,
      model: parsed.data.model || null,
      firmware_version: parsed.data.firmware_version || null,
      os_version: parsed.data.os_version || null,
      protocols: parsed.data.protocols,
      risk_level: parsed.data.risk_level,
      risk_score: parsed.data.risk_score,
      tags: parsed.data.tags,
      metadata: {},
    } as never)
    .select("*")
    .single();
  const asset = (assetData ?? null) as Asset | null;

  if (error || !asset) {
    return validationError(error?.message ?? "Unable to create asset.");
  }

  return {
    success: true,
    data: asset,
  };
}

export async function updateAsset(
  id: string,
  data: UpdateAssetInput,
): Promise<ActionResult<Asset>> {
  const parsed = updateAssetSchema.safeParse(data);

  if (!parsed.success) {
    return validationError("Invalid asset update payload.");
  }

  const context = await getDataContext();

  if (!context) {
    return validationError("You must be signed in to update assets.");
  }

  if (!canManageAssets(context.profile.role)) {
    return validationError("Your role does not have permission to update assets.");
  }

  const { data: assetData, error } = await context.supabase
    .from("assets")
    .update({
      ...parsed.data,
      ip_address: parsed.data.ip_address || null,
      mac_address: parsed.data.mac_address || null,
      manufacturer: parsed.data.manufacturer || null,
      model: parsed.data.model || null,
      firmware_version: parsed.data.firmware_version || null,
      os_version: parsed.data.os_version || null,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const asset = (assetData ?? null) as Asset | null;

  if (error || !asset) {
    return validationError(error?.message ?? "Unable to update asset.");
  }

  return {
    success: true,
    data: asset,
  };
}

export async function deleteAsset(id: string): Promise<ActionResult<Asset>> {
  const context = await getDataContext();

  if (!context) {
    return validationError("You must be signed in to delete assets.");
  }

  if (!canManageAssets(context.profile.role)) {
    return validationError("Your role does not have permission to delete assets.");
  }

  const { data: assetData, error } = await context.supabase
    .from("assets")
    .delete()
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  const asset = (assetData ?? null) as Asset | null;

  if (error || !asset) {
    return validationError(error?.message ?? "Unable to delete asset.");
  }

  return {
    success: true,
    data: asset,
  };
}

export type AssetWithAlerts = Asset & {
  recent_alerts: Alert[];
};
