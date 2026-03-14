"use server";

import { revalidatePath } from "next/cache";

import {
  acknowledgeAlert,
  bulkAcknowledgeAlerts,
  resolveAlert,
  suppressAlert,
} from "@/lib/data/alerts";

export async function acknowledgeAlertAction(id: string) {
  const result = await acknowledgeAlert(id);

  if (result.success) {
    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    revalidatePath("/assets");
  }

  return result;
}

export async function resolveAlertAction(id: string) {
  const result = await resolveAlert(id);

  if (result.success) {
    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    revalidatePath("/assets");
  }

  return result;
}

export async function suppressAlertAction(id: string) {
  const result = await suppressAlert(id);

  if (result.success) {
    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    revalidatePath("/assets");
  }

  return result;
}

export async function bulkAcknowledgeAlertsAction(ids: string[]) {
  const result = await bulkAcknowledgeAlerts(ids);

  if (result.success) {
    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    revalidatePath("/assets");
  }

  return result;
}
