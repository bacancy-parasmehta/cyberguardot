import type {
  ActionResult,
  Incident,
  IncidentDetail,
  IncidentStats,
  IncidentStatus,
} from "@/types";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validations";

export async function getIncidents(): Promise<Incident[]> {
  return [];
}

export async function getIncidentById(
  _id: string,
): Promise<IncidentDetail | null> {
  return null;
}

export async function getIncidentStats(): Promise<IncidentStats> {
  return {
    total: 0,
    open: 0,
    investigating: 0,
    contained: 0,
    resolved: 0,
    avg_resolution_hours: 0,
  };
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

  return {
    success: false,
    error: "createIncident is not implemented yet.",
  };
}

export async function updateIncidentStatus(
  _id: string,
  _status: IncidentStatus,
): Promise<ActionResult<Incident>> {
  return {
    success: false,
    error: "updateIncidentStatus is not implemented yet.",
  };
}

export async function addIncidentTimelineEntry(
  _id: string,
  _note: string,
): Promise<ActionResult<Incident>> {
  return {
    success: false,
    error: "addIncidentTimelineEntry is not implemented yet.",
  };
}

export async function assignIncident(
  _id: string,
  _userId: string,
): Promise<ActionResult<Incident>> {
  return {
    success: false,
    error: "assignIncident is not implemented yet.",
  };
}

