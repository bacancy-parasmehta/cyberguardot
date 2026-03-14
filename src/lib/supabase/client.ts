import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types";
import { getSupabasePublishableValue, getSupabaseUrl } from "@/lib/config";

export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableValue(),
  );
}

