import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseBulkAgentRows } from "@/lib/agent-bulk-upload";
import { isAdminEmail } from "@/lib/admin-access";
import { normalizeAgents } from "@/lib/agent-compat";
import { applyBuyerhqrankFields } from "@/lib/buyerhqrank";
import type { Database, Json } from "@/lib/database.types";
import {
  extractMissingColumnName,
  extractNotNullColumnName,
  isMissingColumnError,
  isMissingRelationError,
  isOnConflictConstraintError,
  isPolicyRecursionError,
} from "@/lib/db-errors";
import { syncExternalReviews } from "@/lib/review-sync";
import { buildAgentSlug } from "@/lib/slug";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

  if (!isAdminEmail(user.email)) {
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
  const { data, error } = await client.from("admin_accounts").select("*").eq("id", user.id).maybeSingle();

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

function stripColumnFromAgentRows(
  rows: Database["public"]["Tables"]["agents"]["Insert"][],
  column: string
) {
  return rows.map((row) => {
    const next = { ...row } as Record<string, unknown>;
    delete next[column];
    return next as Database["public"]["Tables"]["agents"]["Insert"];
  });
}

function addSlugToAgentRows(rows: Database["public"]["Tables"]["agents"]["Insert"][]) {
  return rows.map((row, index) => {
    const next = { ...row } as Record<string, unknown>;
    const existingSlug = typeof next.slug === "string" ? next.slug.trim() : "";
    if (!existingSlug) {
      const name = typeof next.name === "string" ? next.name : "";
      const email = typeof next.email === "string" ? next.email : "";
      next.slug = buildAgentSlug(name, email, index);
    }
    return next as Database["public"]["Tables"]["agents"]["Insert"];
  });
}

function applyAgentNotNullFallback(
  rows: Database["public"]["Tables"]["agents"]["Insert"][],
  column: string
) {
  const normalized = column.toLowerCase();

  if (normalized === "slug") {
    return {
      rows: addSlugToAgentRows(rows),
      changed: true,
    };
  }

  const mutated = rows.map((row) => {
    const next = { ...row } as Record<string, unknown>;
    switch (normalized) {
      case "created_at":
        if (!next.created_at) next.created_at = new Date().toISOString();
        break;
      case "is_active":
        if (typeof next.is_active !== "boolean") next.is_active = true;
        break;
      case "is_verified":
        if (typeof next.is_verified !== "boolean") next.is_verified = false;
        break;
      case "suburbs":
        if (!Array.isArray(next.suburbs)) next.suburbs = [];
        break;
      case "specializations":
        if (!Array.isArray(next.specializations)) next.specializations = [];
        break;
      default:
        break;
    }
    return next as Database["public"]["Tables"]["agents"]["Insert"];
  });

  const changed =
    normalized === "created_at" ||
    normalized === "is_active" ||
    normalized === "is_verified" ||
    normalized === "suburbs" ||
    normalized === "specializations";

  return { rows: mutated, changed };
}

function stripColumnFromAgentPatch(
  patch: Database["public"]["Tables"]["agents"]["Update"],
  column: string
) {
  const next = { ...patch } as Record<string, unknown>;
  delete next[column];
  return next as Database["public"]["Tables"]["agents"]["Update"];
}

function deriveAgentSystemPatch(
  current: Database["public"]["Tables"]["agents"]["Row"],
  patch: Database["public"]["Tables"]["agents"]["Update"]
) {
  const merged = { ...current, ...patch } as Record<string, unknown>;
  const derived = applyBuyerhqrankFields(merged);
  return {
    total_followers: derived.total_followers,
    social_media_presence: derived.social_media_presence,
    authority_score: derived.authority_score,
    buyerhqrank: derived.buyerhqrank,
    profile_status: derived.profile_status,
    verified: derived.verified,
    claimed_at: derived.claimed_at,
    last_updated: derived.last_updated,
    is_verified: derived.is_verified,
  } as Database["public"]["Tables"]["agents"]["Update"];
}

async function manualUpsertAgentsWithoutConflict(
  client: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["agents"]["Insert"][]
) {
  for (const rawRow of rows) {
    let row = { ...rawRow } as Database["public"]["Tables"]["agents"]["Insert"];

    if (!row.email) {
      return { error: { message: "Each uploaded row requires email." } as { message: string } };
    }

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const { data: existing, error: existingError } = await client
        .from("agents")
        .select("id")
        .eq("email", row.email)
        .limit(1);
      if (existingError) {
        return { error: existingError };
      }

      const existingId = existing?.[0]?.id;
      const { error: writeError } = existingId
        ? await client.from("agents").update(row).eq("id", existingId)
        : await client.from("agents").insert(row);

      if (!writeError) {
        break;
      }

      const missingColumn = extractMissingColumnName(writeError.message, "agents");
      if (missingColumn) {
        row = stripColumnFromAgentRows([row], missingColumn)[0];
        continue;
      }

      const notNullColumn = extractNotNullColumnName(writeError.message);
      if (notNullColumn) {
        const applied = applyAgentNotNullFallback([row], notNullColumn);
        if (applied.changed) {
          row = applied.rows[0];
          continue;
        }
      }

      return { error: writeError };
    }
  }

  return { error: null };
}

export async function GET() {
  try {
    const privileged = await getPrivilegedClient();
    if (privileged.error || !privileged.client) {
      return NextResponse.json({ error: privileged.error }, { status: privileged.status });
    }

    const client = privileged.client;
    const publicClient = createPublicClient();
    const warnings: string[] = [];

    const [agents, enquiries, brokerStates, brokerNotes, reviews, reviewSources, externalReviews, posts, contacts, adminAccount] = await Promise.all([
      fetchTableRows(client, "agents", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "enquiries", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "broker_enquiry_states", warnings, { fallbackClient: publicClient, orderBy: "updated_at" }),
      fetchTableRows(client, "broker_enquiry_notes", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "reviews", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "agency_review_sources", warnings, { fallbackClient: publicClient, orderBy: "updated_at" }),
      fetchTableRows(client, "external_reviews", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "blog_posts", warnings, { fallbackClient: publicClient }),
      fetchTableRows(client, "contact_submissions", warnings, { fallbackClient: publicClient }),
      fetchAdminAccountRow(client, privileged.user, warnings),
    ]);

    const warningMessage = warnings.length > 0 ? Array.from(new Set(warnings)).join(" | ") : undefined;
    const policyFallback = warnings.some((item) => item.includes("policy recursion"));

    return NextResponse.json({
      agents: normalizeAgents(agents as Database["public"]["Tables"]["agents"]["Row"][]),
      enquiries,
      brokerStates,
      brokerNotes,
      reviews,
      reviewSources,
      externalReviews,
      posts,
      contacts,
      adminAccount,
      schemaFallback: warnings.length > 0,
      policyFallback,
      warning: warningMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load admin panel." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
    | { type: "bulk_upsert_agents"; rows: unknown[] }
    | { type: "claim_agent_profile"; id: string }
    | { type: "upsert_review_source"; source: Database["public"]["Tables"]["agency_review_sources"]["Insert"] & { id?: string } }
    | { type: "delete_review_source"; id: string }
    | {
      type: "set_external_review_state";
      id: string;
      patch: Pick<
        Database["public"]["Tables"]["external_reviews"]["Update"],
        "is_approved" | "is_hidden" | "is_featured"
      >;
    }
    | { type: "sync_external_reviews"; sourceId?: string; force?: boolean }
    | {
      type: "upsert_broker_state";
      enquiry_id: string;
      patch: Partial<
        Pick<
          Database["public"]["Tables"]["broker_enquiry_states"]["Insert"],
          "owner_email" | "priority" | "stage" | "sla_due_at" | "next_action" | "last_touch_at" | "metadata"
        >
      >;
    }
    | { type: "add_broker_note"; enquiry_id: string; note: string; is_internal?: boolean };

    const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

    switch (payload.type) {
    case "update_agent": {
      const allowedFields = new Set([
        "is_verified",
        "is_active",
        "name",
        "agency_name",
        "phone",
        "state",
        "bio",
        "about",
        "avatar_url",
        "suburbs",
        "specializations",
        "fee_structure",
        "website_url",
        "linkedin_url",
        "years_experience",
        "properties_purchased",
        "avg_rating",
        "review_count",
        "licence_number",
        "licence_verified_at",
        "instagram_followers",
        "facebook_followers",
        "tiktok_followers",
        "youtube_subscribers",
        "linkedin_connections",
        "linkedin_followers",
        "pinterest_followers",
        "x_followers",
        "snapchat_followers",
        "google_rating",
        "google_reviews",
        "facebook_rating",
        "facebook_reviews",
        "ratemyagent_rating",
        "ratemyagent_reviews",
        "trustpilot_rating",
        "trustpilot_reviews",
        "productreview_rating",
        "productreview_reviews",
        "profile_status",
        "verified",
      ]);
      const patch = Object.fromEntries(
        Object.entries(payload.patch ?? {}).filter(([key]) => allowedFields.has(key))
      ) as Database["public"]["Tables"]["agents"]["Update"];
      if (typeof patch.is_verified === "boolean" && !patch.verified) {
        patch.verified = patch.is_verified ? "Verified" : "Unverified";
      }
      if (!payload.id || Object.keys(patch).length === 0) return fail("Invalid agent update payload.");

      const { data: currentAgent, error: currentAgentError } = await client
        .from("agents")
        .select("*")
        .eq("id", payload.id)
        .maybeSingle();
      if (currentAgentError) return fail(currentAgentError.message, 500);
      if (!currentAgent) return fail("Agent not found.", 404);

      let effectivePatch = {
        ...patch,
        ...deriveAgentSystemPatch(currentAgent, patch),
      } as Database["public"]["Tables"]["agents"]["Update"];
      const strippedColumns = new Set<string>();
      let error: { message: string } | null = null;

      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (Object.keys(effectivePatch).length === 0) {
          return NextResponse.json({
            success: true,
            schemaFallback: true,
            strippedColumns: Array.from(strippedColumns),
          });
        }

        const updateResult = await client.from("agents").update(effectivePatch).eq("id", payload.id);
        error = updateResult.error;
        if (!error) break;

        const missingColumn = extractMissingColumnName(error.message, "agents");
        if (missingColumn) {
          strippedColumns.add(missingColumn);
          effectivePatch = stripColumnFromAgentPatch(effectivePatch, missingColumn);
          continue;
        }

        if (isMissingColumnError(error.message, "is_active", "agents")) {
          strippedColumns.add("is_active");
          effectivePatch = stripColumnFromAgentPatch(effectivePatch, "is_active");
          continue;
        }
        if (isMissingColumnError(error.message, "is_verified", "agents")) {
          strippedColumns.add("is_verified");
          effectivePatch = stripColumnFromAgentPatch(effectivePatch, "is_verified");
          continue;
        }

        break;
      }

      if (error && isPolicyRecursionError(error.message)) {
        return fail(policyFixHint, 500);
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({
        success: true,
        schemaFallback: strippedColumns.size > 0,
        strippedColumns: Array.from(strippedColumns),
      });
    }

    case "claim_agent_profile": {
      if (!payload.id) return fail("Missing agent id.");

      const { data: currentAgent, error: currentError } = await client
        .from("agents")
        .select("*")
        .eq("id", payload.id)
        .maybeSingle();
      if (currentError) return fail(currentError.message, 500);
      if (!currentAgent) return fail("Agent not found.", 404);

      const claimedAt = new Date().toISOString();
      let patch = deriveAgentSystemPatch(currentAgent, {
        profile_status: "Claimed",
        verified: "Verified",
        is_verified: true,
        claimed_at: claimedAt,
      });
      const strippedColumns = new Set<string>();
      let error: { message: string } | null = null;

      for (let attempt = 0; attempt < 20; attempt += 1) {
        if (Object.keys(patch).length === 0) {
          return NextResponse.json({
            success: true,
            schemaFallback: true,
            strippedColumns: Array.from(strippedColumns),
          });
        }

        const updateResult = await client.from("agents").update(patch).eq("id", payload.id);
        error = updateResult.error;
        if (!error) break;

        const missingColumn = extractMissingColumnName(error.message, "agents");
        if (missingColumn) {
          strippedColumns.add(missingColumn);
          patch = stripColumnFromAgentPatch(patch, missingColumn);
          continue;
        }

        break;
      }

      if (error) return fail(error.message, 500);
      return NextResponse.json({
        success: true,
        schemaFallback: strippedColumns.size > 0,
        strippedColumns: Array.from(strippedColumns),
      });
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

    case "upsert_review_source": {
      if (!payload.source?.agent_id || !payload.source?.source || !payload.source?.external_id) {
        return fail("agent_id, source, and external_id are required for review sources.");
      }
      const nextSource = {
        ...payload.source,
        metadata: payload.source.metadata ?? {},
      };

      const { error } = await client.from("agency_review_sources").upsert(nextSource);
      if (error && isMissingRelationError(error.message, "agency_review_sources")) {
        return fail(
          "Missing table agency_review_sources. Run supabase/add_external_reviews_and_broker_console.sql.",
          500
        );
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "delete_review_source": {
      if (!payload.id) return fail("Missing review source id.");
      const { error } = await client.from("agency_review_sources").delete().eq("id", payload.id);
      if (error && isMissingRelationError(error.message, "agency_review_sources")) {
        return fail(
          "Missing table agency_review_sources. Run supabase/add_external_reviews_and_broker_console.sql.",
          500
        );
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "set_external_review_state": {
      if (!payload.id || !payload.patch) return fail("Invalid external review moderation payload.");
      const allowedFields = new Set(["is_approved", "is_hidden", "is_featured"]);
      const patch = Object.fromEntries(
        Object.entries(payload.patch).filter(([key]) => allowedFields.has(key))
      );
      if (Object.keys(patch).length === 0) return fail("No moderation fields provided.");

      const { error } = await client.from("external_reviews").update(patch).eq("id", payload.id);
      if (error && isMissingRelationError(error.message, "external_reviews")) {
        return fail(
          "Missing table external_reviews. Run supabase/add_external_reviews_and_broker_console.sql.",
          500
        );
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "sync_external_reviews": {
      const result = await syncExternalReviews(client, {
        sourceId: payload.sourceId,
        force: Boolean(payload.force),
      });
      return NextResponse.json({ success: true, result });
    }

    case "upsert_broker_state": {
      if (!payload.enquiry_id) return fail("Missing enquiry_id.");
      const allowedFields = new Set([
        "owner_email",
        "priority",
        "stage",
        "sla_due_at",
        "next_action",
        "last_touch_at",
        "metadata",
      ]);
      const patch = Object.fromEntries(
        Object.entries(payload.patch ?? {}).filter(([key]) => allowedFields.has(key))
      );
      const nextState = {
        enquiry_id: payload.enquiry_id,
        ...patch,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client.from("broker_enquiry_states").upsert(nextState);
      if (error && isMissingRelationError(error.message, "broker_enquiry_states")) {
        return fail(
          "Missing table broker_enquiry_states. Run supabase/add_external_reviews_and_broker_console.sql.",
          500
        );
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "add_broker_note": {
      if (!payload.enquiry_id || !payload.note?.trim()) return fail("enquiry_id and note are required.");
      const { error } = await client.from("broker_enquiry_notes").insert({
        enquiry_id: payload.enquiry_id,
        note: payload.note.trim(),
        is_internal: payload.is_internal ?? true,
        author_email: privileged.user.email ?? null,
      });
      if (error && isMissingRelationError(error.message, "broker_enquiry_notes")) {
        return fail(
          "Missing table broker_enquiry_notes. Run supabase/add_external_reviews_and_broker_console.sql.",
          500
        );
      }
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

      case "bulk_upsert_agents": {
        if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
          return fail("No rows provided for bulk upload.");
        }

        const parsedRows = parseBulkAgentRows(payload.rows);
        if (parsedRows.rows.length === 0) {
          return fail("No valid rows found to upload.");
        }
        if (parsedRows.errors.length > 0) {
          return fail(`Validation failed: ${parsedRows.errors.slice(0, 10).join(" | ")}`);
        }

        let effectiveRows = addSlugToAgentRows(parsedRows.rows.map((row) => ({ ...row })));
        let error: { message: string } | null = null;

        for (let attempt = 0; attempt < 15; attempt += 1) {
          const upsertResult = await client.from("agents").upsert(effectiveRows, { onConflict: "email" });
          error = upsertResult.error;

          if (!error) {
            break;
          }

          if (isOnConflictConstraintError(error.message)) {
            const manual = await manualUpsertAgentsWithoutConflict(client, effectiveRows);
            error = manual.error;
            break;
          }

          const missingColumn = extractMissingColumnName(error.message, "agents");
          if (missingColumn) {
            effectiveRows = stripColumnFromAgentRows(effectiveRows, missingColumn);
            continue;
          }

          const notNullColumn = extractNotNullColumnName(error.message);
          if (notNullColumn) {
            const applied = applyAgentNotNullFallback(effectiveRows, notNullColumn);
            if (applied.changed) {
              effectiveRows = applied.rows;
              continue;
            }
          }

          break;
        }

        if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
        if (error) return fail(error.message, 500);
        return NextResponse.json({ success: true, inserted: effectiveRows.length });
      }

      default:
        return fail("Unsupported admin action.");
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected admin action failure." },
      { status: 500 }
    );
  }
}
