import {
  createServerClient as createSupabaseServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types";
import { getSupabasePublishableValue, getSupabaseUrl } from "@/lib/config";

export async function createServerClient() {
  const cookieStore = cookies();

  return createSupabaseServerClient<Database>(getSupabaseUrl(), getSupabasePublishableValue(), {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Middleware handles the primary auth cookie refresh path.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Middleware handles the primary auth cookie refresh path.
        }
      },
    },
  });
}

