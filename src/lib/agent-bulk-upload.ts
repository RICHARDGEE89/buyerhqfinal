import type { Database } from "@/lib/database.types";
import { validateMinimalAgencyRow } from "@/lib/agency-minimal-schema";
import { applyBuyerhqrankFields } from "@/lib/buyerhqrank";
import {
  applyBuyerhqrankToSimplifiedRow,
  normalizeSimplifiedBuyerhqrankRow,
} from "@/lib/buyerhqrank-simplified";

type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];

export type DuplicateResolutionStrategy = "abort" | "update_existing" | "skip_duplicates";

export type AgentBulkParseResult = {
  rows: AgentInsert[];
  errors: string[];
  duplicateAgencyKeys: string[];
  duplicateAgentNames: string[];
};

type ParseBulkOptions = {
  defaultState?: string;
};

const stateCodes = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);

const keyAliasMap: Record<string, string> = {
  name: "name",
  agent_name: "name",
  first_name: "first_name",
  last_name: "last_name",
  agency: "agency_name",
  agency_name: "agency_name",
  business_name: "agency_name",
  email: "email",
  phone: "phone",
  agent: "name",
  address: "address",
  state: "state",
  suburbs: "suburbs",
  suburb_coverage: "suburbs",
  primary_suburb: "suburbs",
  specialist: "specialisations",
  specialisations: "specialisations",
  specializations: "specialisations",
  area: "area_specialist",
  years_of_experience: "years_of_experience",
  years_experience: "years_of_experience",
  experience: "years_of_experience",
  properties_purchased: "properties_purchased",
  total_properties: "properties_purchased",
  properties: "properties_purchased",
  verified: "verified",
  verified_status: "verified",
  is_verified: "verified",
  status: "profile_status",
  profile_status: "profile_status",
  claimed_at: "claimed_at",
  active: "is_active",
  is_active: "is_active",
  area_specialist: "area_specialist",
  fee_structure: "fee_structure",
  fee_description: "fee_structure",
  website: "website_url",
  website_url: "website_url",
  linkedin_url: "linkedin_url",
  slug: "slug",
  profile_description: "profile_description",
  bio: "profile_description",
  agent_bio: "profile_description",
  about_agency: "about",
  about: "about",

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
  youtube_followers: "youtube_subscribers",

  social_media_presence: "social_media_presence",
  social_media_score: "social_media_presence",
  total_followers: "total_followers",
  authority_score: "authority_score",
  buyerhq_rank: "buyerhqrank",
  buyerhqrank: "buyerhqrank",
  last_updated: "last_updated",
};

export function parseBulkAgentRows(input: unknown, options: ParseBulkOptions = {}): AgentBulkParseResult {
  const sourceRows = Array.isArray(input) ? input : [input];
  const rows: AgentInsert[] = [];
  const errors: string[] = [];
  const keyCount = new Map<string, number>();
  const nameCount = new Map<string, number>();
  const duplicateAgencyKeys = new Set<string>();
  const duplicateAgentNames = new Set<string>();

  sourceRows.forEach((rawItem, index) => {
    if (!rawItem || typeof rawItem !== "object") {
      errors.push(`Row ${index + 1}: must be an object.`);
      return;
    }

    const raw = normalizeInputRow(rawItem as Record<string, unknown>);

    const inferredState =
      normalizeStateCode(raw.state) ||
      extractStateFromText(`${toText(raw.area_specialist)} ${toText(raw.address)}`) ||
      normalizeStateCode(options.defaultState);
    const inferredSuburbs = toText(raw.suburbs) || toText(raw.address) || toText(raw.area_specialist);
    const inferredArea = toText(raw.area_specialist) || toText(raw.suburbs) || toText(raw.address);

    const simplified = normalizeSimplifiedBuyerhqrankRow({
      agency_name: raw.agency_name,
      state: inferredState,
      suburbs: inferredSuburbs,
      specialisations: raw.specialisations,
      years_of_experience: raw.years_of_experience,
      properties_purchased: raw.properties_purchased,
      verified: raw.verified,
      profile_status: raw.profile_status,
      claimed_at: raw.claimed_at,
      area_specialist: inferredArea,
      fee_structure: raw.fee_structure,
      google_rating: raw.google_rating,
      google_reviews: raw.google_reviews,
      facebook_rating: raw.facebook_rating,
      facebook_reviews: raw.facebook_reviews,
      productreview_rating: raw.productreview_rating,
      productreview_reviews: raw.productreview_reviews,
      trustpilot_rating: raw.trustpilot_rating,
      trustpilot_reviews: raw.trustpilot_reviews,
      ratemyagent_rating: raw.ratemyagent_rating,
      ratemyagent_reviews: raw.ratemyagent_reviews,
      profile_description: raw.profile_description ?? raw.agent_bio,
      about: raw.about ?? raw.about_agency,
      social_media_presence: raw.social_media_presence,
      total_followers: raw.total_followers,
      authority_score: raw.authority_score,
      instagram_followers: raw.instagram_followers,
      facebook_followers: raw.facebook_followers,
      tiktok_followers: raw.tiktok_followers,
      youtube_subscribers: raw.youtube_subscribers,
      linkedin_connections: raw.linkedin_connections,
      linkedin_followers: raw.linkedin_followers,
      pinterest_followers: raw.pinterest_followers,
      x_followers: raw.x_followers,
      snapchat_followers: raw.snapchat_followers,
      last_updated: raw.last_updated,
    });

    if (!simplified.agency_name) {
      errors.push(`Row ${index + 1}: "agency_name" is required.`);
      return;
    }
    if (!stateCodes.has(simplified.state)) {
      errors.push(`Row ${index + 1}: state "${simplified.state}" is invalid.`);
      return;
    }

    const validation = validateMinimalAgencyRow(simplified as unknown as Record<string, unknown>);
    if (!validation.valid) {
      validation.errors.forEach((error) => errors.push(`Row ${index + 1}: ${error}`));
      return;
    }

    const duplicateKey = buildDuplicateAgencyKey(simplified.agency_name, simplified.state);
    const seenCount = keyCount.get(duplicateKey) ?? 0;
    keyCount.set(duplicateKey, seenCount + 1);
    if (seenCount > 0) duplicateAgencyKeys.add(duplicateKey);

    const computed = applyBuyerhqrankToSimplifiedRow(simplified);
    const agentName =
      toText(raw.name) ||
      `${toText(raw.first_name)} ${toText(raw.last_name)}`.trim() ||
      computed.agency_name;
    const nameKey = normalizeDuplicateText(agentName);
    if (nameKey) {
      const seenNameCount = nameCount.get(nameKey) ?? 0;
      nameCount.set(nameKey, seenNameCount + 1);
      if (seenNameCount > 0) duplicateAgentNames.add(agentName);
    }

    const suburbs = csvToArray(computed.suburbs);
    const areaSpecialist = parseAreaSpecialistSuburb(computed.area_specialist);
    if (areaSpecialist && !suburbs.some((item) => item.toLowerCase() === areaSpecialist.toLowerCase())) {
      suburbs.unshift(areaSpecialist);
    }

    const specializations = csvToArray(computed.specialisations);
    const email =
      toText(raw.email).toLowerCase() ||
      buildInternalUploadEmail({
        name: agentName,
        agencyName: computed.agency_name,
        state: computed.state,
        primarySuburb: suburbs[0] ?? "",
        rowIndex: index,
      });

    const websiteUrl = normalizeWebsiteUrl(toNullableText(raw.website_url));
    const avatarFromSite = websiteUrl ? buildCompanyLogoUrl(websiteUrl) : null;
    const avatarUrl = toNullableText(raw.avatar_url) || toNullableText(raw.headshot_url) || avatarFromSite;
    const mergedBio = [computed.profile_description, computed.about].filter(Boolean).join("\n\n").trim() || null;

    const baseRow: Record<string, unknown> = {
      name: agentName,
      email,
      phone: toNullableText(raw.phone),
      agency_name: computed.agency_name,
      bio: mergedBio,
      about: computed.about || null,
      avatar_url: avatarUrl,
      slug: toNullableText(raw.slug),
      state: computed.state,
      suburbs,
      specializations,
      years_experience: computed.years_of_experience,
      properties_purchased: computed.properties_purchased,
      avg_rating: computed.google_rating,
      review_count: computed.google_reviews,
      is_verified: computed.verified === "Verified",
      verified: computed.verified,
      is_active: toBoolean(raw.is_active) ?? true,
      licence_number: toNullableText(raw.licence_number),
      fee_structure: computed.fee_structure || null,
      website_url: websiteUrl,
      linkedin_url: toNullableText(raw.linkedin_url),
      profile_status: computed.profile_status,
      claimed_at: computed.claimed_at,
      social_media_presence: computed.social_media_presence,
      total_followers: computed.total_followers,
      authority_score: computed.authority_score,
      instagram_followers: computed.instagram_followers,
      facebook_followers: computed.facebook_followers,
      tiktok_followers: computed.tiktok_followers,
      youtube_subscribers: computed.youtube_subscribers,
      linkedin_connections: computed.linkedin_connections,
      linkedin_followers: computed.linkedin_followers,
      pinterest_followers: computed.pinterest_followers,
      x_followers: computed.x_followers,
      snapchat_followers: computed.snapchat_followers,
      google_rating: computed.google_rating,
      google_reviews: computed.google_reviews,
      facebook_rating: computed.facebook_rating,
      facebook_reviews: computed.facebook_reviews,
      productreview_rating: computed.productreview_rating,
      productreview_reviews: computed.productreview_reviews,
      trustpilot_rating: computed.trustpilot_rating,
      trustpilot_reviews: computed.trustpilot_reviews,
      ratemyagent_rating: computed.ratemyagent_rating,
      ratemyagent_reviews: computed.ratemyagent_reviews,
      last_updated: computed.last_updated || new Date().toISOString(),
    };

    const withDerived = applyBuyerhqrankFields(baseRow, computed.last_updated || new Date().toISOString());
    rows.push(withDerived as AgentInsert);
  });

  return {
    rows,
    errors,
    duplicateAgencyKeys: Array.from(duplicateAgencyKeys),
    duplicateAgentNames: Array.from(duplicateAgentNames),
  };
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

export function buildDuplicateAgencyKey(agencyName: string, state: string) {
  void state;
  return agencyName.trim().toLowerCase();
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

function normalizeKey(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function csvToArray(value: string) {
  if (!value.trim()) return [];
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAreaSpecialistSuburb(value: string) {
  if (!value.trim()) return "";
  return value.split(",")[0]?.trim() ?? "";
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableText(value: unknown) {
  const text = toText(value);
  return text || null;
}

function normalizeWebsiteUrl(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function normalizeStateCode(value: unknown) {
  const normalized = toText(value).toUpperCase();
  return stateCodes.has(normalized) ? normalized : "";
}

function extractStateFromText(value: string) {
  const match = value.toUpperCase().match(/\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT)\b/);
  return match?.[1] ?? "";
}

function normalizeDuplicateText(value: string) {
  return value.trim().toLowerCase();
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
