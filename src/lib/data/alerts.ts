import type { ActionResult, Alert, AlertStats } from "@/types";

export async function getAlerts(): Promise<Alert[]> {
  return [];
}

export async function getAlertStats(): Promise<AlertStats> {
  return {
    total: 0,
    new: 0,
    critical: 0,
    high: 0,
    acknowledged_today: 0,
  };
}

export async function acknowledgeAlert(_id: string): Promise<ActionResult<Alert>> {
  return {
    success: false,
    error: "acknowledgeAlert is not implemented yet.",
  };
}

export async function resolveAlert(_id: string): Promise<ActionResult<Alert>> {
  return {
    success: false,
    error: "resolveAlert is not implemented yet.",
  };
}

export async function suppressAlert(_id: string): Promise<ActionResult<Alert>> {
  return {
    success: false,
    error: "suppressAlert is not implemented yet.",
  };
}

export async function bulkAcknowledgeAlerts(
  _ids: string[],
): Promise<ActionResult<Alert[]>> {
  return {
    success: false,
    error: "bulkAcknowledgeAlerts is not implemented yet.",
  };
}

