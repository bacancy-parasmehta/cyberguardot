"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/data/audit";
import {
  addIncidentTimelineEntry,
  assignIncident,
  updateIncidentStatus,
} from "@/lib/data/incidents";
import type { IncidentStatus } from "@/types";

function revalidateIncidentPaths(id: string) {
  revalidatePath("/incidents");
  revalidatePath(`/incidents/${id}`);
  revalidatePath("/dashboard");
}

export async function updateIncidentStatusAction(id: string, status: IncidentStatus) {
  const result = await updateIncidentStatus(id, status);

  if (result.success) {
    await recordAuditLog({
      action: "incident_status_updated",
      entityType: "incident",
      entityId: id,
      newValues: { status },
    });
    revalidateIncidentPaths(id);
  }

  return result;
}

export async function addIncidentTimelineEntryAction(id: string, note: string) {
  const result = await addIncidentTimelineEntry(id, note);

  if (result.success) {
    await recordAuditLog({
      action: "incident_note_added",
      entityType: "incident",
      entityId: id,
      newValues: { note },
    });
    revalidateIncidentPaths(id);
  }

  return result;
}

export async function assignIncidentToMeAction(id: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      error: "You must be signed in to assign incidents.",
    };
  }

  const result = await assignIncident(id, currentUser.user.id);

  if (result.success) {
    await recordAuditLog({
      action: "incident_assigned_to_self",
      entityType: "incident",
      entityId: id,
      newValues: { assigned_to: currentUser.user.id },
    });
    revalidateIncidentPaths(id);
  }

  return result;
}
