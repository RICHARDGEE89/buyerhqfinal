import { NextResponse } from "next/server";

import type { StateCode } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function parseBoolean(value: string | null) {
  if (value === null) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const stateParam = searchParams.get("state");
    const state = stateParam && stateCodes.includes(stateParam as StateCode) ? (stateParam as StateCode) : null;
    const specializationRaw = searchParams.getAll("specialization");
    const specializationCsv = searchParams.get("specializations");
    const verifiedOnly = parseBoolean(searchParams.get("verified"));
    const minRatingParam = searchParams.get("minRating");
    const search = searchParams.get("search");
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") ?? "12", 10), 1), 50);

    const specializations = [
      ...specializationRaw,
      ...(specializationCsv ? specializationCsv.split(",").map((item) => item.trim()) : []),
    ].filter(Boolean);

    const minRating = minRatingParam ? Number.parseFloat(minRatingParam) : null;
    if (stateParam && !state) {
      return NextResponse.json({ error: "Invalid state filter provided." }, { status: 400 });
    }

    const from = (Math.max(page, 1) - 1) * limit;
    const to = from + limit - 1;

    const supabase = createClient();
    let query = supabase
      .from("agents")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("avg_rating", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (state) query = query.eq("state", state);
    if (verifiedOnly === true) query = query.eq("is_verified", true);
    if (minRating !== null && !Number.isNaN(minRating)) query = query.gte("avg_rating", minRating);
    if (specializations.length > 0) query = query.overlaps("specializations", specializations);

    if (search) {
      const term = search.trim();
      if (term) {
        const safeTerm = term.replace(/[%]/g, "");
        query = query.or(
          `name.ilike.%${safeTerm}%,agency_name.ilike.%${safeTerm}%,suburbs.cs.{${safeTerm}}`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      agents: data ?? [],
      total: count ?? 0,
      page: Math.max(page, 1),
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch agents" }, { status: 500 });
  }
}
