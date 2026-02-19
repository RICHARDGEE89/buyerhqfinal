import { NextResponse } from "next/server";

import { getLocationsByPostcode, getPrimaryPostcodeForSuburb } from "@/lib/australia-locations";
import {
  agentIsActive,
  agentIsVerified,
  agentSuburbs,
  normalizeAgents,
  sanitizePublicAgents,
} from "@/lib/agent-compat";
import type { AgentRow, StateCode } from "@/lib/database.types";
import { isPolicyRecursionError } from "@/lib/db-errors";
import { createClient } from "@/lib/supabase/server";

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const postcodePattern = /^\d{4}$/;
const sortValues = new Set(["rating_desc", "authority_desc", "experience_desc", "reviews_desc", "newest_desc", "name_asc"]);
const policyFixHint =
  "Detected legacy recursive RLS policy on public.users. Run supabase/fix_live_schema_compatibility.sql.";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseBoolean(value: string | null) {
  if (value === null) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function parseNumber(value: string | null) {
  if (!value) return null;
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getPostcodeLocalities(postcode: string) {
  return getLocationsByPostcode(postcode).map((location) => location.locality.toLowerCase());
}

function buildLocationHints(agents: AgentRow[]) {
  const counts = new Map<
    string,
    {
      suburb: string;
      state: string | null;
      count: number;
    }
  >();

  agents.forEach((agent) => {
    const state = agent.state ?? null;
    agentSuburbs(agent).forEach((suburbRaw) => {
      const suburb = suburbRaw.trim();
      if (!suburb) return;
      const key = `${suburb.toLowerCase()}|${state ?? ""}`;
      const existing = counts.get(key);
      if (!existing) {
        counts.set(key, { suburb, state, count: 1 });
      } else {
        existing.count += 1;
      }
    });
  });

  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count || a.suburb.localeCompare(b.suburb))
    .slice(0, 40)
    .map((item) => ({
      suburb: item.suburb,
      state: item.state,
      postcode: getPrimaryPostcodeForSuburb(item.suburb, item.state),
      count: item.count,
    }));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const stateParam = searchParams.get("state");
    const state = stateParam && stateCodes.includes(stateParam as StateCode) ? (stateParam as StateCode) : null;
    const specializationRaw = searchParams.getAll("specialization");
    const specializationCsv = searchParams.get("specializations");
    const verifiedOnly = parseBoolean(searchParams.get("verified"));
    const minRating = parseNumber(searchParams.get("minRating"));
    const minExperience = parseNumber(searchParams.get("minExperience"));
    const minReviews = parseNumber(searchParams.get("minReviews"));
    const hasFee = parseBoolean(searchParams.get("hasFee"));
    const sortParam = searchParams.get("sort") ?? "rating_desc";
    const sort = sortValues.has(sortParam) ? sortParam : "rating_desc";

    const search = searchParams.get("search");
    const suburbParam = searchParams.get("suburb")?.trim() ?? "";
    const postcodeParam = searchParams.get("postcode")?.trim() ?? "";
    const locationParam = searchParams.get("location")?.trim() ?? "";
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(Math.max(Number.parseInt(searchParams.get("limit") ?? "12", 10), 1), 100);

    const specializations = [
      ...specializationRaw,
      ...(specializationCsv ? specializationCsv.split(",").map((item) => item.trim()) : []),
    ].filter(Boolean);

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
          locationHints: [],
          warning: policyFixHint,
        });
      }
      return NextResponse.json({
        agents: [],
        total: 0,
        page: currentPage,
        locationHints: [],
        warning: error.message || "Unable to fetch agents. Showing 0 results.",
      });
    }

    const searchTerm = search?.trim().toLowerCase() ?? "";
    const locationPostcodeMatch = locationParam.match(/\b\d{4}\b/);
    const locationTerm = locationParam.replace(/\b\d{4}\b/g, "").trim().toLowerCase();
    const suburbNeedle = suburbParam.toLowerCase();
    const effectivePostcode =
      postcodePattern.test(postcodeParam)
        ? postcodeParam
        : locationPostcodeMatch?.[0]
          ? locationPostcodeMatch[0]
          : postcodePattern.test(searchTerm)
            ? searchTerm
            : "";
    const postcodeLocalities = effectivePostcode ? getPostcodeLocalities(effectivePostcode) : [];
    const searchTermPostcodeLocalities = postcodePattern.test(searchTerm) ? getPostcodeLocalities(searchTerm) : [];
    const normalized = normalizeAgents((data ?? []) as AgentRow[]);

    const filtered = normalized.filter((agent) => {
      if (state && (agent.state ?? "") !== state) return false;
      if (!agentIsActive(agent)) return false;
      if (verifiedOnly === true && !agentIsVerified(agent)) return false;
      if (minRating !== null) {
        const rating = typeof agent.avg_rating === "number" ? agent.avg_rating : 0;
        if (rating < minRating) return false;
      }
      if (minExperience !== null) {
        const years = typeof agent.years_experience === "number" ? agent.years_experience : 0;
        if (years < minExperience) return false;
      }
      if (minReviews !== null) {
        const reviews = typeof agent.review_count === "number" ? agent.review_count : 0;
        if (reviews < minReviews) return false;
      }
      if (hasFee === true && !(agent.fee_structure ?? "").trim()) return false;
      if (specializations.length > 0) {
        const agentSpecs = agent.specializations ?? [];
        const matched = specializations.some((spec) => agentSpecs.includes(spec));
        if (!matched) return false;
      }

      const suburbs = agentSuburbs(agent).map((suburb) => suburb.toLowerCase());
      if (suburbNeedle && !suburbs.some((suburb) => suburb.includes(suburbNeedle))) return false;

      if (locationTerm) {
        const locationMatches = suburbs.some((suburb) => suburb.includes(locationTerm));
        if (!locationMatches && !postcodePattern.test(locationTerm)) return false;
      }

      if (postcodeLocalities.length > 0) {
        const byPostcode = suburbs.some((suburb) =>
          postcodeLocalities.some((locality) => suburb.includes(locality) || locality.includes(suburb))
        );
        if (!byPostcode) return false;
      }

      if (!searchTerm) return true;

      const byName = agent.name.toLowerCase().includes(searchTerm);
      const byAgency = (agent.agency_name ?? "").toLowerCase().includes(searchTerm);
      const bySuburb = suburbs.some((suburb) => suburb.includes(searchTerm));
      const byPostcode = searchTermPostcodeLocalities.length
        ? suburbs.some((suburb) =>
            searchTermPostcodeLocalities.some(
              (locality) => suburb.includes(locality) || locality.includes(suburb)
            )
          )
        : false;
      return byName || byAgency || bySuburb || byPostcode;
    });

    filtered.sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "experience_desc") {
        const yearsA = typeof a.years_experience === "number" ? a.years_experience : -1;
        const yearsB = typeof b.years_experience === "number" ? b.years_experience : -1;
        if (yearsA !== yearsB) return yearsB - yearsA;
      }
      if (sort === "authority_desc") {
        const authorityA = typeof a.authority_score === "number" ? a.authority_score : -1;
        const authorityB = typeof b.authority_score === "number" ? b.authority_score : -1;
        if (authorityA !== authorityB) return authorityB - authorityA;
      }
      if (sort === "reviews_desc") {
        const reviewsA = typeof a.review_count === "number" ? a.review_count : -1;
        const reviewsB = typeof b.review_count === "number" ? b.review_count : -1;
        if (reviewsA !== reviewsB) return reviewsB - reviewsA;
      }
      if (sort === "newest_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      const ratingA = typeof a.avg_rating === "number" ? a.avg_rating : -1;
      const ratingB = typeof b.avg_rating === "number" ? b.avg_rating : -1;
      if (ratingA !== ratingB) return ratingB - ratingA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const locationHints = buildLocationHints(filtered);
    const pagedAgents = sanitizePublicAgents(filtered.slice(from, to));

    return NextResponse.json({
      agents: pagedAgents,
      total: filtered.length,
      page: currentPage,
      locationHints,
    });
  } catch {
    return NextResponse.json({
      agents: [],
      total: 0,
      page: 1,
      locationHints: [],
      warning: "Unable to fetch agents. Showing 0 results.",
    });
  }
}
