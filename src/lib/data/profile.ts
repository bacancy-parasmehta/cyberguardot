import type { ActionResult, Profile } from "@/types";
import { createServerClient } from "@/lib/supabase/server";

function validationError(message: string): ActionResult<never> {
  return {
    success: false,
    error: message,
  };
}

export async function updateProfile(
  fullName: string,
): Promise<ActionResult<Profile>> {
  const trimmedName = fullName.trim();

  if (trimmedName.length === 0) {
    return validationError("Full name is required.");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return validationError("You must be signed in to update your profile.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: trimmedName } as never)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();
  const profile = (data ?? null) as Profile | null;

  if (error || !profile) {
    return validationError(error?.message ?? "Unable to update profile.");
  }

  return {
    success: true,
    data: profile,
  };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult<null>> {
  if (currentPassword.trim().length === 0) {
    return validationError("Current password is required.");
  }

  if (newPassword.length < 8) {
    return validationError("New password must be at least 8 characters.");
  }

  if (currentPassword === newPassword) {
    return validationError("New password must be different from the current password.");
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return validationError(error.message);
  }

  return {
    success: true,
    data: null,
  };
}

export async function signOutOtherSessions(): Promise<ActionResult<null>> {
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signOut({ scope: "others" as never });

  if (error) {
    return validationError(error.message);
  }

  return {
    success: true,
    data: null,
  };
}
