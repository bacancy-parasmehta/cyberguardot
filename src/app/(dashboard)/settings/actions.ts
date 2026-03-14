"use server";

import { revalidatePath } from "next/cache";

import { recordAuditLog } from "@/lib/data/audit";
import {
  changePassword,
  signOutOtherSessions,
  updateProfile,
} from "@/lib/data/profile";

export async function updateProfileAction(fullName: string) {
  const result = await updateProfile(fullName);

  if (result.success) {
    await recordAuditLog({
      action: "profile_updated",
      entityType: "profile",
      entityId: result.data?.id ?? null,
      newValues: { full_name: result.data?.full_name ?? fullName },
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
  }

  return result;
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const result = await changePassword(currentPassword, newPassword);

  if (result.success) {
    await recordAuditLog({
      action: "password_changed",
      entityType: "profile",
      newValues: { password_changed: true },
    });
    revalidatePath("/settings");
  }

  return result;
}

export async function signOutOtherSessionsAction() {
  const result = await signOutOtherSessions();

  if (result.success) {
    await recordAuditLog({
      action: "other_sessions_revoked",
      entityType: "session",
      newValues: { scope: "others" },
    });
    revalidatePath("/settings");
  }

  return result;
}
