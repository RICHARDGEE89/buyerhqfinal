import type { Database } from "@/lib/database.types";
import { validateAgencyProfilePayload } from "@/lib/agency-json-schema";
import { applyBuyerhqrankFields, profileStatusValues, verifiedValues } from "@/lib/buyerhqrank";

type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];

export type AgentBulkParseResult = {
  rows: AgentInsert[];
  errors: string[];
};

const stateCodes = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);
const keyAliasMap: Record<string, string> = {
  name: "name",
  agency: "agency_name",
  agency_name: "agency_name",
  business_name: "business_name",
  state: "state",
  suburbs: "suburbs",
  specialisations: "specialisations",
  specializations: "specializations",
  years_of_experience: "years_experience",
  years_experience: "years_experience",
  properties_purchased: "properties_purchased",
  verified: "verified",
  verified_status: "verified_status",
  status: "profile_status",
  profile_status: "profile_status",
  claimed_at: "claimed_at",
  area_specialist: "area_specialist",
  fee_structure: "fee_structure",
  website: "website_url",
  website_url: "website_url",
  active: "is_active",
  ig: "instagram_followers",
  fb: "facebook_followers",
  tiktok: "tiktok_followers",
  instagram_followers: "instagram_followers",
  facebook_followers: "facebook_followers",
  tiktok_followers: "tiktok_followers",
  youtube_subscribers: "youtube_subscribers",
  linkedin_connections: "linkedin_connections",
  linkedin_followers: "linkedin_followers",
  pinterest_followers: "pinterest_followers",
  x_followers: "x_followers",
  snapchat_followers: "snapchat_followers",
  google_rating: "google_rating",
  google_reviews: "google_reviews",
  facebook_rating: "facebook_rating",
  facebook_reviews: "facebook_reviews",
  productreview_rating: "productreview_rating",
  productreview_reviews: "productreview_reviews",
  trustpilot_rating: "trustpilot_rating",
  trustpilot_reviews: "trustpilot_reviews",
  ratemyagent_rating: "ratemyagent_rating",
  ratemyagent_reviews: "ratemyagent_reviews",
  profile_description: "profile_description",
  about: "about",
  social_media_presence: "social_media_presence",
  total_followers: "total_followers",
  authority_score: "authority_score",
  last_updated: "last_updated",
  email: "email",
  phone: "phone",
};

export function parseBulkAgentRows(input: unknown): AgentBulkParseResult {
  const sourceRows = Array.isArray(input) ? input : [input];
  const rows: AgentInsert[] = [];
  const errors: string[] = [];

  sourceRows.forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== "object") {
      errors.push(`Row ${index + 1}: must be an object.`);
      return;
    }

    const raw = normalizeInputRow(rawItem as Record<string, unknown>);
    const agencyName = toText(raw.agency_name) || toText(raw.business_name);
    const name =
      toText(raw.name) ||
      toText(raw.agent_name) ||
      `${toText(raw.first_name)} ${toText(raw.last_name)}`.trim() ||
      agencyName;

    if (!name) {
      errors.push(`Row ${index + 1}: provide at least one of "name", "agent_name", or "agency_name".`);
      return;
    }

    const state = (toText(raw.state) || toText(raw.primary_state)).toUpperCase();
    if (state && !stateCodes.has(state)) {
      errors.push(`Row ${index + 1}: state "${state}" is invalid.`);
      return;
    }

    const suburbs =
      toStringArrayFlexible(raw.suburbs) ??
      toStringArrayFlexible(raw.suburb_coverage) ??
      (toText(raw.primary_suburb) ? [toText(raw.primary_suburb)] : []);
    const areaSpecialist = toText(raw.area_specialist);
    const areaSuburb = parseAreaSpecialistSuburb(areaSpecialist);
    if (areaSuburb && !suburbs.some((item) => item.toLowerCase() === areaSuburb.toLowerCase())) {
      suburbs.unshift(areaSuburb);
    }

    const specializations = toStringArrayFlexible(raw.specializations) ?? toStringArrayFlexible(raw.specialisations) ?? [];
    const email =
      toText(raw.email).toLowerCase() ||
      buildInternalUploadEmail({
        name,
        agencyName,
        state,
        primarySuburb: suburbs[0] ?? "",
        rowIndex: index,
      });

    const websiteUrl = normalizeWebsiteUrl(toNullableText(raw.website_url));
    const avatarFromSite = websiteUrl ? buildCompanyLogoUrl(websiteUrl) : null;
    const avatarUrl = toNullableText(raw.avatar_url) || toNullableText(raw.headshot_url) || avatarFromSite;

    const profileDescription = toText(raw.profile_description);
    const about = toText(raw.about);
    const mergedBio =
      [profileDescription, about, toText(raw.bio)]
        .filter(Boolean)
        .join("\n\n")
        .trim() || null;

    const profileStatus = normalizeProfileStatus(raw.profile_status);
    const verified = normalizeVerified(raw.verified, raw.verified_status, raw.is_verified);

    const baseRow: Record<string, unknown> = {
      name,
      email,
      phone: toNullableText(raw.phone),
      agency_name: agencyName || null,
      bio: mergedBio,
      about: about || null,
      avatar_url: avatarUrl,
      slug: toNullableText(raw.slug),
      state: state || null,
      suburbs,
      specializations,
      years_experience: pickNonNegativeInt(raw.years_experience, raw.years_of_experience),
      properties_purchased: pickNonNegativeInt(raw.properties_purchased, raw.total_properties),
      avg_rating: pickRating(raw.avg_rating, raw.google_rating),
      review_count: pickNonNegativeInt(raw.review_count, raw.google_reviews),
      is_verified: verified === "Verified",
      verified,
      is_active: toBoolean(raw.is_active) ?? true,
      licence_number: toNullableText(raw.licence_number),
      fee_structure: toNullableText(raw.fee_structure) || toNullableText(raw.fee_description),
      website_url: websiteUrl,
      linkedin_url: toNullableText(raw.linkedin_url),
      profile_status: profileStatus,
      claimed_at: profileStatus === "Claimed" ? toNullableText(raw.claimed_at) : null,

      instagram_followers: toNonNegativeInt(raw.instagram_followers),
      facebook_followers: toNonNegativeInt(raw.facebook_followers),
      tiktok_followers: toNonNegativeInt(raw.tiktok_followers),
      youtube_subscribers: toNonNegativeInt(raw.youtube_subscribers),
      linkedin_connections: toNonNegativeInt(raw.linkedin_connections),
      linkedin_followers: toNonNegativeInt(raw.linkedin_followers),
      pinterest_followers: toNonNegativeInt(raw.pinterest_followers),
      x_followers: toNonNegativeInt(raw.x_followers),
      snapchat_followers: toNonNegativeInt(raw.snapchat_followers),

      google_rating: toRating(raw.google_rating),
      google_reviews: toNonNegativeInt(raw.google_reviews),
      facebook_rating: toRating(raw.facebook_rating),
      facebook_reviews: toNonNegativeInt(raw.facebook_reviews),
      ratemyagent_rating: toRating(raw.ratemyagent_rating),
      ratemyagent_reviews: toNonNegativeInt(raw.ratemyagent_reviews),
      trustpilot_rating: toRating(raw.trustpilot_rating),
      trustpilot_reviews: toNonNegativeInt(raw.trustpilot_reviews),
      productreview_rating: toRating(raw.productreview_rating),
      productreview_reviews: toNonNegativeInt(raw.productreview_reviews),
    };

    const withDerived = applyBuyerhqrankFields(baseRow);
    const validation = validateAgencyProfilePayload(withDerived);
    if (!validation.valid) {
      validation.errors.forEach((error) => errors.push(`Row ${index + 1}: ${error}`));
      return;
    }

    rows.push(validation.row as AgentInsert);
  });

  return { rows, errors };
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableText(value: unknown) {
  const text = toText(value);
  return text || null;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toStringArrayFlexible(value: unknown) {
  if (Array.isArray(value)) return toStringArray(value);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return null;
}

function toNonNegativeInt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  if (value === "" || value === null || value === undefined) return 0;
  return 0;
}

function toRating(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return clamp(value, 0, 5);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? clamp(parsed, 0, 5) : 0;
  }
  if (value === "" || value === null || value === undefined) return 0;
  return 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.toLowerCase().trim();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "active") return true;
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "inactive") return false;
  }
  return null;
}

function parseAreaSpecialistSuburb(value: string) {
  if (!value.trim()) return "";
  const beforeComma = value.split(",")[0]?.trim() ?? "";
  return beforeComma;
}

function normalizeProfileStatus(value: unknown) {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "claimed") return "Claimed";
    if (normalized === "unclaimed") return "Unclaimed";
  }
  if (profileStatusValues.includes(value as (typeof profileStatusValues)[number])) {
    return value as (typeof profileStatusValues)[number];
  }
  return "Unclaimed";
}

function normalizeVerified(...values: unknown[]) {
  for (const value of values) {
    if (verifiedValues.includes(value as (typeof verifiedValues)[number])) {
      return value as (typeof verifiedValues)[number];
    }
    if (value === true || value === "true") return "Verified";
    if (value === false || value === "false") return "Unverified";
  }
  return "Unverified";
}

export function buildCompanyLogoUrl(websiteUrl: string) {
  try {
    const normalized = /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`;
    const url = new URL(normalized);
    return `https://www.google.com/s2/favicons?sz=256&domain_url=${encodeURIComponent(url.origin)}`;
  } catch {
    return null;
  }
}

function buildInternalUploadEmail(input: {
  name: string;
  agencyName: string;
  state: string;
  primarySuburb: string;
  rowIndex: number;
}) {
  const slugPart = (
    input.agencyName ||
    input.name ||
    `agent-${input.rowIndex + 1}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 40);
  const suburbPart = input.primarySuburb
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 20);
  const statePart = input.state.toLowerCase() || "na";
  const localPart = [slugPart || "agent", statePart, suburbPart || "all"].filter(Boolean).join(".");
  return `${localPart}@profiles.buyerhq.internal`;
}

function pickNonNegativeInt(...values: unknown[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")) {
      return toNonNegativeInt(value);
    }
  }
  return 0;
}

function pickRating(...values: unknown[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "")) {
      return toRating(value);
    }
  }
  return 0;
}

function normalizeWebsiteUrl(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function normalizeKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeInputRow(raw: Record<string, unknown>) {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const normalized = normalizeKey(key);
    const canonical = keyAliasMap[normalized] ?? normalized;
    if (next[canonical] === undefined) {
      next[canonical] = value;
    }
  }
  return next;
}
