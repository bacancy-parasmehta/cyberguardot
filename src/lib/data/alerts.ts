import type { ActionResult, Alert, AlertStats, Asset } from "@/types";
import { getDataContext, type DataContext } from "@/lib/data/context";
import { buildAlertStats } from "@/lib/data/stats";

function mutationError(message: string): ActionResult<never> {
  return { success: false, error: message };
}

function canManageAlerts(role: string): boolean {
  return role === "admin" || role === "engineer" || role === "analyst";
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

async function hydrateAlerts(
  context: DataContext,
  alerts: Alert[],
): Promise<Alert[]> {
  const assetIds = Array.from(
    new Set(
      alerts
        .map((alert) => alert.asset_id)
        .filter((assetId): assetId is string => Boolean(assetId)),
    ),
  );
  const assetNameMap = await getAssetNameMap(context, assetIds);

  return alerts.map((alert) => ({
    ...alert,
    asset_name: alert.asset_id ? assetNameMap.get(alert.asset_id) ?? undefined : undefined,
  }));
}

async function fetchAlertsForFacility(context: DataContext): Promise<Alert[]> {
  const { data, error } = await context.supabase
    .from("alerts")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("triggered_at", { ascending: false });

  if (error) {
    return [];
  }

  return hydrateAlerts(context, data ?? []);
}

async function getMutableAlert(
  context: DataContext,
  id: string,
): Promise<Alert | null> {
  const { data, error } = await context.supabase
    .from("alerts")
    .select("*")
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function persistAlertUpdate(
  context: DataContext,
  id: string,
  values: Partial<Alert>,
): Promise<ActionResult<Alert>> {
  const { data, error } = await context.supabase
    .from("alerts")
    .update(values as never)
    .eq("facility_id", context.facilityId)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    return mutationError(error?.message ?? "Unable to update alert.");
  }

  const [hydratedAlert] = await hydrateAlerts(context, [data]);

  return {
    success: true,
    data: hydratedAlert,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  return fetchAlertsForFacility(context);
}

export async function getAlertStats(): Promise<AlertStats> {
  const context = await getDataContext();

  if (!context) {
    return {
      total: 0,
      new: 0,
      critical: 0,
      high: 0,
      acknowledged_today: 0,
    };
  }

  return buildAlertStats(await fetchAlertsForFacility(context));
}

export async function acknowledgeAlert(id: string): Promise<ActionResult<Alert>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update alerts.");
  }

  if (!canManageAlerts(context.profile.role)) {
    return mutationError("Your role does not have permission to update alerts.");
  }

  const alert = await getMutableAlert(context, id);

  if (!alert) {
    return mutationError("Alert not found.");
  }

  if (alert.status !== "new") {
    return mutationError("Only new alerts can be acknowledged.");
  }

  return persistAlertUpdate(context, id, {
    status: "acknowledged",
    acknowledged_by: context.userId,
    acknowledged_at: new Date().toISOString(),
  });
}

export async function resolveAlert(id: string): Promise<ActionResult<Alert>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update alerts.");
  }

  if (!canManageAlerts(context.profile.role)) {
    return mutationError("Your role does not have permission to update alerts.");
  }

  const alert = await getMutableAlert(context, id);

  if (!alert) {
    return mutationError("Alert not found.");
  }

  if (alert.status === "resolved") {
    return mutationError("Alert is already resolved.");
  }

  if (alert.status === "suppressed") {
    return mutationError("Suppressed alerts cannot be resolved.");
  }

  const timestamp = new Date().toISOString();

  return persistAlertUpdate(context, id, {
    status: "resolved",
    acknowledged_by: alert.acknowledged_by ?? context.userId,
    acknowledged_at: alert.acknowledged_at ?? timestamp,
    resolved_at: timestamp,
  });
}

export async function suppressAlert(id: string): Promise<ActionResult<Alert>> {
  const context = await getDataContext();

  if (!context) {
    return mutationError("You must be signed in to update alerts.");
  }

  if (!canManageAlerts(context.profile.role)) {
    return mutationError("Your role does not have permission to update alerts.");
  }

  const alert = await getMutableAlert(context, id);

  if (!alert) {
    return mutationError("Alert not found.");
  }

  if (alert.status === "suppressed") {
    return mutationError("Alert is already suppressed.");
  }

  const timestamp = new Date().toISOString();

  return persistAlertUpdate(context, id, {
    status: "suppressed",
    acknowledged_by: alert.acknowledged_by ?? context.userId,
    acknowledged_at: alert.acknowledged_at ?? timestamp,
    resolved_at: timestamp,
  });
}

export async function bulkAcknowledgeAlerts(
  ids: string[],
): Promise<ActionResult<Alert[]>> {
  const context = await getDataContext();
  const uniqueIds = Array.from(new Set(ids)).filter(Boolean);

  if (!context) {
    return mutationError("You must be signed in to update alerts.");
  }

  if (!canManageAlerts(context.profile.role)) {
    return mutationError("Your role does not have permission to update alerts.");
  }

  if (uniqueIds.length === 0) {
    return mutationError("Select at least one alert to acknowledge.");
  }

  const timestamp = new Date().toISOString();
  const { data, error } = await context.supabase
    .from("alerts")
    .update({
      status: "acknowledged",
      acknowledged_by: context.userId,
      acknowledged_at: timestamp,
    } as never)
    .eq("facility_id", context.facilityId)
    .eq("status", "new")
    .in("id", uniqueIds)
    .select("*");

  if (error) {
    return mutationError(error.message);
  }

  if (!data || data.length === 0) {
    return mutationError("No new alerts were available to acknowledge.");
  }

  return {
    success: true,
    data: await hydrateAlerts(context, data),
  };
}
