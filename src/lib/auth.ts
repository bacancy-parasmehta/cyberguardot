import { redirect } from "next/navigation";

import { createServerClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types";

export interface CurrentUserResult {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile | null;
}

function isPlaceholderEnv(value: string | undefined): boolean {
  return Boolean(value?.startsWith("your_"));
}

function hasConfiguredSupabase(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableValue = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    supabaseUrl &&
      supabasePublishableValue &&
      !isPlaceholderEnv(supabaseUrl) &&
      !isPlaceholderEnv(supabasePublishableValue),
  );
}

export async function getCurrentUser(): Promise<CurrentUserResult | null> {
  if (!hasConfiguredSupabase()) {
    return null;
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user: {
        id: user.id,
        email: user.email ?? undefined,
      },
      profile: profile ?? null,
    };
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<UserRole | null> {
  const currentUser = await getCurrentUser();
  return currentUser?.profile?.role ?? null;
}

export async function requireAuth(): Promise<CurrentUserResult> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  return currentUser;
}

export async function signOut(): Promise<void> {
  "use server";

  if (hasConfiguredSupabase()) {
    try {
      const supabase = await createServerClient();
      await supabase.auth.signOut();
    } catch {
      // Redirect to login even if the remote sign-out request fails.
    }
  }

  redirect("/auth/login");
}

