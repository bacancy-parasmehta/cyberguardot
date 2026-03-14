"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/data/audit";
import { updateThreatStatus } from "@/lib/data/threats";
import type { ThreatStatus } from "@/types";

export async function updateThreatStatusAction(id: string, status: ThreatStatus) {
  const result = await updateThreatStatus(id, status);

  if (result.success) {
    await recordAuditLog({
      action: "threat_status_updated",
      entityType: "threat",
      entityId: id,
      newValues: { status },
    });
    revalidatePath("/threats");
    revalidatePath("/dashboard");
  }

  return result;
}
