import { createClient as createJsClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Supabase credentials are missing. Falling back to placeholder values for local build safety."
    );
  }
}

/**
 * Backwards-compatible generic client.
 * Prefer `createBrowserSupabaseClient()` / `createServerSupabaseClient()` for app usage.
 */
export const supabase = createJsClient<Database>(supabaseUrl, supabaseAnonKey);

export const createBrowserSupabaseClient = createBrowserClient;
export const createServerSupabaseClient = createServerClient;
