import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizeAgents } from "@/lib/agent-compat";
import type { Database, Json } from "@/lib/database.types";
import {
  isMissingColumnError,
  isMissingRelationError,
  isOnConflictConstraintError,
  isPolicyRecursionError,
} from "@/lib/db-errors";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);
const policyFixHint =
  "Detected legacy recursive RLS policy on public.users. Run supabase/fix_live_schema_compatibility.sql.";
type DbTables = Database["public"]["Tables"];
type TableName = keyof DbTables;

async function getPrivilegedClient() {
  const serverClient = createServerClient();
  const {
    data: { user },
    error,
  } = await serverClient.auth.getUser();

  if (error || !user?.email) {
    return { error: "Unauthorized", status: 401 as const, client: null };
  }

  const email = user.email.toLowerCase();
  if (!adminAllowList.has(email)) {
    return { error: "Forbidden", status: 403 as const, client: null };
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return {
      error: null,
      status: 200 as const,
      client: createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
      ),
      user,
    };
  }

  return { error: null, status: 200 as const, client: serverClient, user };
}

function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createSupabaseClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function tableLabel(tableName: TableName) {
  return String(tableName);
}

function summarizeWarning(message: string) {
  if (isPolicyRecursionError(message)) return policyFixHint;
  return message;
}

async function fetchTableRows<K extends TableName>(
  client: SupabaseClient<Database>,
  tableName: K,
  warnings: string[],
  opts?: {
    orderBy?: string;
    fallbackClient?: SupabaseClient<Database> | null;
  }
): Promise<DbTables[K]["Row"][]> {
  const orderBy = opts?.orderBy ?? "created_at";
  let query = client.from(tableName).select("*");
  if (orderBy) {
    query = query.order(orderBy as never, { ascending: false });
  }

  let { data, error } = await query;

  if (error && orderBy && isMissingColumnError(error.message, orderBy, tableLabel(tableName))) {
    ({ data, error } = await client.from(tableName).select("*"));
  }

  if (!error) {
    return ((data ?? []) as unknown) as DbTables[K]["Row"][];
  }

  if (isPolicyRecursionError(error.message) && opts?.fallbackClient) {
    let fallbackQuery = opts.fallbackClient.from(tableName).select("*");
    if (orderBy) {
      fallbackQuery = fallbackQuery.order(orderBy as never, { ascending: false });
    }
    let { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError && orderBy && isMissingColumnError(fallbackError.message, orderBy, tableLabel(tableName))) {
      ({ data: fallbackData, error: fallbackError } = await opts.fallbackClient.from(tableName).select("*"));
    }

    if (!fallbackError) {
      warnings.push(`Using public fallback for ${tableLabel(tableName)} due policy recursion.`);
      return ((fallbackData ?? []) as unknown) as DbTables[K]["Row"][];
    }
  }

  if (isMissingRelationError(error.message, tableLabel(tableName))) {
    warnings.push(`Missing table ${tableLabel(tableName)}. Using empty data.`);
    return [];
  }

  warnings.push(`${tableLabel(tableName)}: ${summarizeWarning(error.message)}`);
  return [];
}

async function fetchAdminAccountRow(
  client: SupabaseClient<Database>,
  user: { id: string; email?: string | null },
  warnings: string[]
) {
  let { data, error } = await client.from("admin_accounts").select("*").eq("id", user.id).maybeSingle();

  if (!error) {
    return data;
  }

  if (
    isMissingRelationError(error.message, "admin_accounts") ||
    isMissingColumnError(error.message, "preferences", "admin_accounts") ||
    isPolicyRecursionError(error.message)
  ) {
    warnings.push(`admin_accounts: ${summarizeWarning(error.message)}`);
    return {
      id: user.id,
      email: user.email ?? "",
      created_at: "",
      preferences: {},
    };
  }

  warnings.push(`admin_accounts: ${error.message}`);
  return {
    id: user.id,
    email: user.email ?? "",
    created_at: "",
    preferences: {},
  };
}

export async function GET() {
  const privileged = await getPrivilegedClient();
  if (privileged.error || !privileged.client) {
    return NextResponse.json({ error: privileged.error }, { status: privileged.status });
  }

  const client = privileged.client;
  const publicClient = createPublicClient();
  const warnings: string[] = [];

  const [agents, enquiries, reviews, posts, contacts, adminAccount] = await Promise.all([
    fetchTableRows(client, "agents", warnings, { fallbackClient: publicClient }),
    fetchTableRows(client, "enquiries", warnings, { fallbackClient: publicClient }),
    fetchTableRows(client, "reviews", warnings, { fallbackClient: publicClient }),
    fetchTableRows(client, "blog_posts", warnings, { fallbackClient: publicClient }),
    fetchTableRows(client, "contact_submissions", warnings, { fallbackClient: publicClient }),
    fetchAdminAccountRow(client, privileged.user, warnings),
  ]);

  const warningMessage = warnings.length > 0 ? Array.from(new Set(warnings)).join(" | ") : undefined;
  const policyFallback = warnings.some((item) => item.includes("policy recursion"));

  return NextResponse.json({
    agents: normalizeAgents(agents as Database["public"]["Tables"]["agents"]["Row"][]),
    enquiries,
    reviews,
    posts,
    contacts,
    adminAccount,
    schemaFallback: warnings.length > 0,
    policyFallback,
    warning: warningMessage,
  });
}

export async function POST(request: Request) {
  const privileged = await getPrivilegedClient();
  if (privileged.error || !privileged.client) {
    return NextResponse.json({ error: privileged.error }, { status: privileged.status });
  }

  const client = privileged.client;
  const payload = (await request.json()) as
    | { type: "update_agent"; id: string; patch: Record<string, unknown> }
    | { type: "delete_agent"; id: string }
    | { type: "approve_review"; id: string }
    | { type: "reject_review"; id: string }
    | { type: "toggle_post_published"; id: string; value: boolean }
    | { type: "delete_post"; id: string }
    | { type: "resolve_all_contacts" }
    | { type: "close_buyer_enquiries"; buyer_email: string }
    | { type: "update_admin_preferences"; preferences: Json }
    | { type: "bulk_upsert_agents"; rows: Database["public"]["Tables"]["agents"]["Insert"][] };

  const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

  switch (payload.type) {
    case "update_agent": {
      const allowedFields = new Set([
        "is_verified",
        "is_active",
        "licence_verified_at",
        "name",
        "agency_name",
        "phone",
        "state",
        "bio",
        "suburbs",
        "specializations",
        "fee_structure",
      ]);
      const patch = Object.fromEntries(
        Object.entries(payload.patch ?? {}).filter(([key]) => allowedFields.has(key))
      );
      if (!payload.id || Object.keys(patch).length === 0) return fail("Invalid agent update payload.");

      const effectivePatch = { ...patch };
      let { error } = await client.from("agents").update(effectivePatch).eq("id", payload.id);

      if (error && isMissingColumnError(error.message, "is_active", "agents")) {
        delete effectivePatch.is_active;
        ({ error } = await client.from("agents").update(effectivePatch).eq("id", payload.id));
      }
      if (error && isMissingColumnError(error.message, "is_verified", "agents")) {
        delete effectivePatch.is_verified;
        delete effectivePatch.licence_verified_at;
        ({ error } = await client.from("agents").update(effectivePatch).eq("id", payload.id));
      }

      if (Object.keys(effectivePatch).length === 0) {
        return NextResponse.json({ success: true, schemaFallback: true });
      }

      if (error && isPolicyRecursionError(error.message)) {
        return fail(policyFixHint, 500);
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "delete_agent": {
      if (!payload.id) return fail("Missing agent id.");
      const { error } = await client.from("agents").delete().eq("id", payload.id);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "approve_review": {
      if (!payload.id) return fail("Missing review id.");
      const { error } = await client.from("reviews").update({ is_approved: true }).eq("id", payload.id);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "reject_review": {
      if (!payload.id) return fail("Missing review id.");
      const { error } = await client.from("reviews").delete().eq("id", payload.id);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "toggle_post_published": {
      if (!payload.id) return fail("Missing post id.");
      const { error } = await client
        .from("blog_posts")
        .update({ is_published: Boolean(payload.value) })
        .eq("id", payload.id);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "delete_post": {
      if (!payload.id) return fail("Missing post id.");
      const { error } = await client.from("blog_posts").delete().eq("id", payload.id);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "resolve_all_contacts": {
      const { error } = await client
        .from("contact_submissions")
        .update({ is_resolved: true })
        .eq("is_resolved", false);
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "close_buyer_enquiries": {
      if (!payload.buyer_email) return fail("Missing buyer_email.");
      const { error } = await client
        .from("enquiries")
        .update({ status: "closed" })
        .eq("buyer_email", payload.buyer_email)
        .neq("status", "closed");
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "update_admin_preferences": {
      const basePayload = {
        id: privileged.user.id,
        email: privileged.user.email ?? "",
      };

      const withPreferences = {
        ...basePayload,
        preferences: payload.preferences ?? {},
      };

      const { error } = await client.from("admin_accounts").upsert(withPreferences);
      if (!error) return NextResponse.json({ success: true });

      if (isMissingColumnError(error.message, "preferences", "admin_accounts")) {
        const fallback = await client.from("admin_accounts").upsert(basePayload);
        if (!fallback.error) return NextResponse.json({ success: true, schemaFallback: true });
      }

      if (isMissingRelationError(error.message, "admin_accounts")) {
        return NextResponse.json({ success: true, schemaFallback: true });
      }
      if (isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);

      return fail(error.message, 500);
    }

    case "bulk_upsert_agents": {
      if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
        return fail("No rows provided for bulk upload.");
      }

      let effectiveRows = payload.rows.map((row) => ({ ...row }));
      let { error } = await client.from("agents").upsert(effectiveRows, { onConflict: "email" });
      if (error && isMissingColumnError(error.message, "is_active", "agents")) {
        effectiveRows = effectiveRows.map((row) => {
          const next = { ...row } as Record<string, unknown>;
          delete next.is_active;
          return next as Database["public"]["Tables"]["agents"]["Insert"];
        });
        ({ error } = await client.from("agents").upsert(effectiveRows, { onConflict: "email" }));
      }
      if (error && isMissingColumnError(error.message, "is_verified", "agents")) {
        effectiveRows = effectiveRows.map((row) => {
          const next = { ...row } as Record<string, unknown>;
          delete next.is_verified;
          delete next.is_active;
          return next as Database["public"]["Tables"]["agents"]["Insert"];
        });
        ({ error } = await client.from("agents").upsert(effectiveRows, { onConflict: "email" }));
      }

      if (error && isOnConflictConstraintError(error.message)) {
        for (const row of effectiveRows) {
          const { data: existing, error: existingError } = await client
            .from("agents")
            .select("id")
            .eq("email", row.email)
            .limit(1);
          if (existingError) {
            error = existingError;
            break;
          }

          const existingId = existing?.[0]?.id;
          if (existingId) {
            const { error: updateError } = await client.from("agents").update(row).eq("id", existingId);
            if (updateError) {
              error = updateError;
              break;
            }
          } else {
            const { error: insertError } = await client.from("agents").insert(row);
            if (insertError) {
              error = insertError;
              break;
            }
          }
          error = null;
        }
      }
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true, inserted: effectiveRows.length });
    }

    default:
      return fail("Unsupported admin action.");
  }
}
