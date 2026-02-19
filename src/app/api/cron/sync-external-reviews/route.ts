import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";
import { syncExternalReviews } from "@/lib/review-sync";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function hasValidCronSecret(request: Request) {
  const expected = process.env.REVIEW_SYNC_CRON_SECRET;
  if (!expected) return true;

  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("key");
  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";

  return queryKey === expected || headerSecret === expected || bearerSecret === expected;
}

function getPrivilegedClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return createServerClient();
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId") ?? undefined;
    const force = searchParams.get("force") === "true";

    const client = getPrivilegedClient();
    const result = await syncExternalReviews(client, { sourceId, force });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Review sync job failed." },
      { status: 500 }
    );
  }
}
