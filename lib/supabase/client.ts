import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseCredentials } from "@/lib/env";
import type { Database } from "@/types/database";

export function createClient() {
  const { url, anonKey } = getSupabaseCredentials();

  return createBrowserClient<Database>(url, anonKey);
}
