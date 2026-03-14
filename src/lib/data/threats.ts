import type {
  ActionResult,
  Threat,
  ThreatDetail,
  ThreatStats,
  ThreatStatus,
} from "@/types";
import { createThreatSchema, type CreateThreatInput } from "@/lib/validations";

export async function getThreats(): Promise<Threat[]> {
  return [];
}

export async function getThreatById(_id: string): Promise<ThreatDetail | null> {
  return null;
}

export async function getThreatStats(): Promise<ThreatStats> {
  return {
    total: 0,
    active: 0,
    investigating: 0,
    contained: 0,
    resolved: 0,
  };
}

export async function updateThreatStatus(
  _id: string,
  _status: ThreatStatus,
): Promise<ActionResult<Threat>> {
  return {
    success: false,
    error: "updateThreatStatus is not implemented yet.",
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

  return {
    success: false,
    error: "createThreat is not implemented yet.",
  };
}

