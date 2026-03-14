import type { ActionResult, Profile } from "@/types";

export async function updateProfile(
  _fullName: string,
): Promise<ActionResult<Profile>> {
  return {
    success: false,
    error: "updateProfile is not implemented yet.",
  };
}

export async function changePassword(
  _currentPassword: string,
  _newPassword: string,
): Promise<ActionResult<null>> {
  return {
    success: false,
    error: "changePassword is not implemented yet.",
  };
}

