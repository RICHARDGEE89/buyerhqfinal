import { NextResponse } from "next/server";
import { findLocationsByPostcode } from "aus-postcode-suburbs";

import { agentIsActive, agentIsVerified, agentSuburbs, normalizeAgents } from "@/lib/agent-compat";
import type { AgentRow, StateCode } from "@/lib/database.types";
import { isPolicyRecursionError } from "@/lib/db-errors";
import { createClient } from "@/lib/supabase/server";

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const postcodePattern = /^\d{4}$/;
const postcodeLocalityCache = new Map<string, string[]>();
const policyFixHint =
  "Detected legacy recursive RLS policy on public.users. Run supabase/fix_live_schema_compatibility.sql.";

function parseBoolean(value: string | null) {
  if (value === null) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function getPostcodeLocalities(postcode: string) {
  if (postcodeLocalityCache.has(postcode)) {
    return postcodeLocalityCache.get(postcode) ?? [];
  }

  const localities = findLocationsByPostcode(postcode).map((location) => location.locality.toLowerCase());
  postcodeLocalityCache.set(postcode, localities);
  return localities;
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

    const currentPage = Math.max(page, 1);
    const from = (currentPage - 1) * limit;
    const to = from + limit;

    const supabase = createClient();
    const { data, error } = await supabase.from("agents").select("*");

    if (error) {
      if (isPolicyRecursionError(error.message)) {
        return NextResponse.json({
          agents: [],
          total: 0,
          page: currentPage,
          warning: policyFixHint,
        });
      }
      return NextResponse.json({
        agents: [],
        total: 0,
        page: currentPage,
        warning: error.message || "Unable to fetch agents. Showing 0 results.",
      });
    }

    const searchTerm = search?.trim().toLowerCase() ?? "";
    const postcodeLocalities = postcodePattern.test(searchTerm) ? getPostcodeLocalities(searchTerm) : [];
    const normalized = normalizeAgents((data ?? []) as AgentRow[]);

    const filtered = normalized.filter((agent) => {
      if (state && (agent.state ?? "") !== state) return false;
      if (!agentIsActive(agent)) return false;
      if (verifiedOnly === true && !agentIsVerified(agent)) return false;
      if (minRating !== null && !Number.isNaN(minRating)) {
        const rating = typeof agent.avg_rating === "number" ? agent.avg_rating : 0;
        if (rating < minRating) return false;
      }
      if (specializations.length > 0) {
        const agentSpecs = agent.specializations ?? [];
        const matched = specializations.some((spec) => agentSpecs.includes(spec));
        if (!matched) return false;
      }
      if (!searchTerm) return true;

      const byName = agent.name.toLowerCase().includes(searchTerm);
      const byAgency = (agent.agency_name ?? "").toLowerCase().includes(searchTerm);
      const byEmail = agent.email.toLowerCase().includes(searchTerm);
      const suburbs = agentSuburbs(agent).map((suburb) => suburb.toLowerCase());
      const bySuburb = suburbs.some((suburb) => suburb.includes(searchTerm));
      const byPostcode = postcodeLocalities.length
        ? suburbs.some((suburb) =>
            postcodeLocalities.some(
              (locality) => suburb.includes(locality) || locality.includes(suburb)
            )
          )
        : false;
      return byName || byAgency || byEmail || bySuburb || byPostcode;
    });

    filtered.sort((a, b) => {
      const ratingA = typeof a.avg_rating === "number" ? a.avg_rating : -1;
      const ratingB = typeof b.avg_rating === "number" ? b.avg_rating : -1;
      if (ratingA === ratingB) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return ratingB - ratingA;
    });

    return NextResponse.json({
      agents: filtered.slice(from, to),
      total: filtered.length,
      page: currentPage,
    });
  } catch {
    return NextResponse.json({
      agents: [],
      total: 0,
      page: 1,
      warning: "Unable to fetch agents. Showing 0 results.",
    });
  }
}
