"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/data/audit";
import { updateControlStatus } from "@/lib/data/compliance";
import type { ComplianceStatus } from "@/types";

export async function updateControlStatusAction(
  id: string,
  status: ComplianceStatus,
  evidence?: string,
) {
  const result = await updateControlStatus(id, status, evidence);

  if (result.success) {
    await recordAuditLog({
      action: "compliance_control_updated",
      entityType: "compliance_control",
      entityId: id,
      newValues: { status, evidence: evidence ?? null },
    });
    revalidatePath("/compliance");
  }

  return result;
}
