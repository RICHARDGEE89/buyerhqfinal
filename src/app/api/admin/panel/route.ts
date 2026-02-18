import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database, Json } from "@/lib/database.types";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);

function isMissingColumnError(message: string, column: string) {
  const lower = message.toLowerCase();
  return lower.includes("column") && lower.includes(column.toLowerCase()) && lower.includes("does not exist");
}

function isMissingRelationError(message: string, relation: string) {
  const lower = message.toLowerCase();
  return lower.includes("relation") && lower.includes(relation.toLowerCase()) && lower.includes("does not exist");
}

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
    const fallbackAdmin =
      adminRes.error &&
      (isMissingColumnError(adminRes.error.message, "preferences") ||
        isMissingRelationError(adminRes.error.message, "admin_accounts"))
        ? { id: privileged.user.id, email: privileged.user.email ?? "", created_at: "", preferences: {} }
        : null;

    if (!fallbackAdmin) {
      return NextResponse.json({ error: firstError.message }, { status: 500 });
    }

    return NextResponse.json({
      agents: agentsRes.data ?? [],
      enquiries: enquiriesRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      posts: postsRes.data ?? [],
      contacts: contactsRes.data ?? [],
      adminAccount: fallbackAdmin,
      schemaFallback: true,
    });
  }

  return NextResponse.json({
    agents: agentsRes.data ?? [],
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
      const { error } = await client.from("agents").update(patch).eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "delete_agent": {
      if (!payload.id) return fail("Missing agent id.");
      const { error } = await client.from("agents").delete().eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "approve_review": {
      if (!payload.id) return fail("Missing review id.");
      const { error } = await client.from("reviews").update({ is_approved: true }).eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "reject_review": {
      if (!payload.id) return fail("Missing review id.");
      const { error } = await client.from("reviews").delete().eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "toggle_post_published": {
      if (!payload.id) return fail("Missing post id.");
      const { error } = await client
        .from("blog_posts")
        .update({ is_published: Boolean(payload.value) })
        .eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "delete_post": {
      if (!payload.id) return fail("Missing post id.");
      const { error } = await client.from("blog_posts").delete().eq("id", payload.id);
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true });
    }

    case "resolve_all_contacts": {
      const { error } = await client
        .from("contact_submissions")
        .update({ is_resolved: true })
        .eq("is_resolved", false);
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

      if (isMissingColumnError(error.message, "preferences")) {
        const fallback = await client.from("admin_accounts").upsert(basePayload);
        if (!fallback.error) return NextResponse.json({ success: true, schemaFallback: true });
      }

      if (isMissingRelationError(error.message, "admin_accounts")) {
        return NextResponse.json({ success: true, schemaFallback: true });
      }

      return fail(error.message, 500);
    }

    case "bulk_upsert_agents": {
      if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
        return fail("No rows provided for bulk upload.");
      }
      const { error } = await client.from("agents").upsert(payload.rows, { onConflict: "email" });
      if (error) return fail(error.message, 500);
      return NextResponse.json({ success: true, inserted: payload.rows.length });
    }

    default:
      return fail("Unsupported admin action.");
  }
}
