import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/config";

export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
}
