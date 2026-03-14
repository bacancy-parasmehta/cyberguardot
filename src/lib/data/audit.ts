import type {
  ActionResult,
  JsonValue,
  AuditLog,
} from "@/types";
import { getDataContext } from "@/lib/data/context";

interface AuditEventInput {
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  oldValues?: JsonValue | null;
  newValues?: JsonValue | null;
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const context = await getDataContext();

  if (!context) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("audit_logs")
    .select("*")
    .eq("facility_id", context.facilityId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  const logs = (data ?? []) as AuditLog[];
  const userIds = Array.from(
    new Set(logs.map((log) => log.user_id).filter((userId): userId is string => Boolean(userId))),
  );

  if (userIds.length === 0) {
    return logs;
  }

  const { data: profiles } = await context.supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);
  const profileMap = new Map(
    (profiles ?? []).map((profile: { id: string; full_name: string | null; email: string }) => [
      profile.id,
      profile.full_name ?? profile.email,
    ]),
  );

  return logs.map((log) => ({
    ...log,
    user_name: log.user_id ? profileMap.get(log.user_id) ?? undefined : undefined,
  }));
}

export async function recordAuditLog({
  action,
  entityType = null,
  entityId = null,
  oldValues = null,
  newValues = null,
}: AuditEventInput): Promise<ActionResult<null>> {
  const context = await getDataContext();

  if (!context) {
    return {
      success: false,
      error: "No active session available for audit logging.",
    };
  }

  const { error } = await context.supabase.from("audit_logs").insert({
    facility_id: context.facilityId,
    user_id: context.userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  } as never);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data: null,
  };
}
