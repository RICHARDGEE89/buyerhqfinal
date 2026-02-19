import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

const FALLBACK_URL = "https://placeholder.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? FALLBACK_KEY;

export const hasSupabaseEnv =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
