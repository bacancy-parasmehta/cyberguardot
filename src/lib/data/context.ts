import { getCurrentUser } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export interface DataContext {
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  facilityId: string;
  profile: Profile;
  userId: string;
}

export async function getDataContext(): Promise<DataContext | null> {
  const currentUser = await getCurrentUser();
  const facilityId = currentUser?.profile?.facility_id;

  if (!currentUser || !currentUser.profile || !facilityId) {
    return null;
  }

  return {
    supabase: await createServerClient(),
    facilityId,
    profile: currentUser.profile,
    userId: currentUser.user.id,
  };
}
