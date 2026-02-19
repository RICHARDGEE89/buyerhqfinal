import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { buildDuplicateAgencyKey, parseBulkAgentRows } from "@/lib/agent-bulk-upload";
import { normalizeAgents } from "@/lib/agent-compat";
import type { Database, Json } from "@/lib/database.types";
import { isMissingColumnError, isMissingRelationError, isPolicyRecursionError } from "@/lib/db-errors";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);
const policyFixHint =
  "Detected legacy recursive RLS policy on public.users. Run supabase/fix_live_schema_compatibility.sql.";
type DuplicateResolutionStrategy = "abort" | "update_existing" | "skip_duplicates";

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

function normalizeDuplicateKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

type ExistingAgentIdentity = Pick<
  Database["public"]["Tables"]["agents"]["Row"],
  "id" | "email" | "name" | "agency_name"
>;

async function fetchExistingAgentIdentities(
  client: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["agents"]["Insert"][]
) {
  const byAgency = new Map<string, ExistingAgentIdentity>();
  const byName = new Map<string, ExistingAgentIdentity>();

  const agencyNames = Array.from(
    new Set(
      rows
        .map((row) => (typeof row.agency_name === "string" ? row.agency_name.trim() : ""))
        .filter(Boolean)
    )
  );
  const names = Array.from(
    new Set(rows.map((row) => (typeof row.name === "string" ? row.name.trim() : "")).filter(Boolean))
  );

  if (agencyNames.length > 0) {
    const { data, error } = await client
      .from("agents")
      .select("id,email,name,agency_name")
      .in("agency_name", agencyNames);
    if (!error) {
      (data ?? []).forEach((row) => {
        const key = normalizeDuplicateKey(row.agency_name);
        if (key && !byAgency.has(key)) byAgency.set(key, row);
      });
    }
  }

  if (names.length > 0) {
    const { data, error } = await client.from("agents").select("id,email,name,agency_name").in("name", names);
    if (!error) {
      (data ?? []).forEach((row) => {
        const key = normalizeDuplicateKey(row.name);
        if (key && !byName.has(key)) byName.set(key, row);
      });
    }
  }

  return { byAgency, byName };
}

export async function GET() {
  const privileged = await getPrivilegedClient();
  if (privileged.error || !privileged.client) {
    return NextResponse.json({ error: privileged.error }, { status: privileged.status });
  }

  const client = privileged.client;
  const [agentsRes, enquiriesRes, reviewsRes, postsRes, contactsRes, adminRes] = await Promise.all([
    client.from("agents").select("*").order("created_at", { ascending: false }),
    client.from("enquiries").select("*").order("created_at", { ascending: false }),
    client.from("reviews").select("*").order("created_at", { ascending: false }),
    client.from("blog_posts").select("*").order("created_at", { ascending: false }),
    client.from("contact_submissions").select("*").order("created_at", { ascending: false }),
    client.from("admin_accounts").select("*").eq("id", privileged.user.id).maybeSingle(),
  ]);

  const firstError =
    agentsRes.error ||
    enquiriesRes.error ||
    reviewsRes.error ||
    postsRes.error ||
    contactsRes.error ||
    adminRes.error;

  if (firstError) {
    if (isPolicyRecursionError(firstError.message)) {
      const publicClient = createPublicClient();
      let publicAgents: { data: Database["public"]["Tables"]["agents"]["Row"][] | null } = { data: [] };
      let publicReviews: { data: Database["public"]["Tables"]["reviews"]["Row"][] | null } = { data: [] };
      let publicPosts: { data: Database["public"]["Tables"]["blog_posts"]["Row"][] | null } = { data: [] };
      if (publicClient) {
        const [agentsFallbackRes, reviewsFallbackRes, postsFallbackRes] = await Promise.all([
          publicClient.from("agents").select("*").order("created_at", { ascending: false }),
          publicClient.from("reviews").select("*").order("created_at", { ascending: false }),
          publicClient.from("blog_posts").select("*").order("created_at", { ascending: false }),
        ]);
        publicAgents = { data: agentsFallbackRes.data };
        publicReviews = { data: reviewsFallbackRes.data };
        publicPosts = { data: postsFallbackRes.data };
      }

      return NextResponse.json({
        agents: normalizeAgents((publicAgents.data ?? []) as Database["public"]["Tables"]["agents"]["Row"][]),
        enquiries: [],
        reviews: publicReviews.data ?? [],
        posts: publicPosts.data ?? [],
        contacts: [],
        adminAccount: {
          id: privileged.user.id,
          email: privileged.user.email ?? "",
          created_at: "",
          preferences: {},
        },
        schemaFallback: true,
        policyFallback: true,
        warning: policyFixHint,
      });
    }

    const fallbackAdmin =
      adminRes.error &&
      (isMissingColumnError(adminRes.error.message, "preferences", "admin_accounts") ||
        isMissingRelationError(adminRes.error.message, "admin_accounts"))
        ? { id: privileged.user.id, email: privileged.user.email ?? "", created_at: "", preferences: {} }
        : null;

    if (!fallbackAdmin) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      agents: normalizeAgents((agentsRes.data ?? []) as Database["public"]["Tables"]["agents"]["Row"][]),
      enquiries: enquiriesRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      posts: postsRes.data ?? [],
      contacts: contactsRes.data ?? [],
      adminAccount: fallbackAdmin,
      schemaFallback: true,
    });
  }

  return NextResponse.json({
    agents: normalizeAgents((agentsRes.data ?? []) as Database["public"]["Tables"]["agents"]["Row"][]),
    enquiries: enquiriesRes.data ?? [],
    reviews: reviewsRes.data ?? [],
    posts: postsRes.data ?? [],
    contacts: contactsRes.data ?? [],
    adminAccount: adminRes.data ?? null,
    schemaFallback: false,
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
    | { type: "bulk_upsert_agents"; rows: unknown[]; duplicate_strategy?: DuplicateResolutionStrategy };

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

      const duplicateStrategy: DuplicateResolutionStrategy = payload.duplicate_strategy ?? "abort";
      const parsedRows = parseBulkAgentRows(payload.rows);
      if (parsedRows.rows.length === 0) {
        return fail("No valid rows found to upload.");
      }
      if (parsedRows.errors.length > 0) {
        return fail(`Validation failed: ${parsedRows.errors.slice(0, 10).join(" | ")}`);
      }

      let effectiveRows = parsedRows.rows.map((row) => ({ ...row }));
      const skipped: string[] = [];

      if (parsedRows.duplicateAgencyKeys.length > 0 || parsedRows.duplicateAgentNames.length > 0) {
        if (duplicateStrategy === "abort") {
          const duplicateSummary = [
            parsedRows.duplicateAgencyKeys.length
              ? `agencies: ${parsedRows.duplicateAgencyKeys.join(", ")}`
              : "",
            parsedRows.duplicateAgentNames.length ? `agents: ${parsedRows.duplicateAgentNames.join(", ")}` : "",
          ]
            .filter(Boolean)
            .join(" | ");
          return fail(
            `Duplicate records found in upload (${duplicateSummary}). ` +
              "Choose a duplicate strategy: update_existing or skip_duplicates."
          );
        }

        const dedupedByAgency = new Map<string, (typeof effectiveRows)[number]>();
        for (const row of effectiveRows) {
          const key = buildDuplicateAgencyKey(row.agency_name ?? "", row.state ?? "");
          if (!dedupedByAgency.has(key)) {
            dedupedByAgency.set(key, row);
            continue;
          }
          skipped.push(key);
          if (duplicateStrategy === "update_existing") {
            dedupedByAgency.set(key, row);
          }
        }
        effectiveRows = Array.from(dedupedByAgency.values());

        const dedupedByName = new Map<string, (typeof effectiveRows)[number]>();
        const unnamedRows: typeof effectiveRows = [];
        for (const row of effectiveRows) {
          const key = normalizeDuplicateKey(row.name);
          if (!key) {
            unnamedRows.push(row);
            continue;
          }
          if (!dedupedByName.has(key)) {
            dedupedByName.set(key, row);
            continue;
          }
          skipped.push(`name:${row.name ?? "unknown"}`);
          if (duplicateStrategy === "update_existing") {
            dedupedByName.set(key, row);
          }
        }
        if (dedupedByName.size > 0) {
          effectiveRows = [...Array.from(dedupedByName.values()), ...unnamedRows];
        }
      }

      const existing = await fetchExistingAgentIdentities(client, effectiveRows);
      const existingConflicts: string[] = [];
      const nextRows: typeof effectiveRows = [];

      for (const row of effectiveRows) {
        const byAgency = existing.byAgency.get(normalizeDuplicateKey(row.agency_name));
        const byName = existing.byName.get(normalizeDuplicateKey(row.name));
        const conflict = byAgency ?? byName;

        if (!conflict) {
          nextRows.push(row);
          continue;
        }

        const key = `${conflict.agency_name || row.agency_name || ""}|${conflict.name || row.name || ""}`;
        existingConflicts.push(key);

        if (duplicateStrategy === "abort") {
          continue;
        }
        if (duplicateStrategy === "skip_duplicates") {
          skipped.push(key);
          continue;
        }

        const nextEmail = conflict.email?.trim().toLowerCase();
        nextRows.push({
          ...row,
          email: nextEmail || row.email,
        });
      }

      if (duplicateStrategy === "abort" && existingConflicts.length > 0) {
        return fail(
          `Duplicate agencies already exist: ${Array.from(new Set(existingConflicts)).join(", ")}. ` +
            "Choose update_existing to overwrite existing rows or skip_duplicates to skip them."
        );
      }

      effectiveRows = nextRows;
      if (effectiveRows.length === 0) {
        return fail("No rows left to upload after duplicate handling.");
      }

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
      if (error && isPolicyRecursionError(error.message)) return fail(policyFixHint, 500);
      if (error) return fail(error.message, 500);
      return NextResponse.json({
        success: true,
        inserted: effectiveRows.length,
        skipped: Array.from(new Set(skipped)).length,
      });
    }

    default:
      return fail("Unsupported admin action.");
  }
}
