import { applyBuyerhqrankFields, profileStatusValues, verifiedValues } from "@/lib/buyerhqrank";

export const simplifiedBuyerhqrankHeadings = [
  "agency_name",
  "state",
  "suburbs",
  "specialisations",
  "years_of_experience",
  "properties_purchased",
  "verified",
  "profile_status",
  "claimed_at",
  "area_specialist",
  "fee_structure",
  "google_rating",
  "google_reviews",
  "facebook_rating",
  "facebook_reviews",
  "profile_description",
  "about",
  "social_platforms",
  "instagram_followers",
  "facebook_followers",
  "tiktok_followers",
  "youtube_subscribers",
  "linkedin_followers",
  "x_followers",
  "total_followers",
  "authority_score",
  "buyerhqrank",
] as const;

export type SimplifiedBuyerhqrankHeading = (typeof simplifiedBuyerhqrankHeadings)[number];

export type SimplifiedBuyerhqrankRow = {
  agency_name: string;
  state: string;
  suburbs: string;
  specialisations: string;
  years_of_experience: number;
  properties_purchased: number;
  verified: "Verified" | "Unverified";
  profile_status: "Claimed" | "Unclaimed";
  claimed_at: string | null;
  area_specialist: string;
  fee_structure: string;
  google_rating: number;
  google_reviews: number;
  facebook_rating: number;
  facebook_reviews: number;
  profile_description: string;
  about: string;
  social_platforms: string;
  instagram_followers: number;
  facebook_followers: number;
  tiktok_followers: number;
  youtube_subscribers: number;
  linkedin_followers: number;
  x_followers: number;
  total_followers: number;
  authority_score: number;
  buyerhqrank: string;
};

export function buildSimplifiedBuyerhqrankTemplateRow(): SimplifiedBuyerhqrankRow {
  return {
    agency_name: "",
    state: "",
    suburbs: "",
    specialisations: "",
    years_of_experience: 0,
    properties_purchased: 0,
    verified: "Unverified",
    profile_status: "Unclaimed",
    claimed_at: null,
    area_specialist: "",
    fee_structure: "",
    google_rating: 0,
    google_reviews: 0,
    facebook_rating: 0,
    facebook_reviews: 0,
    profile_description: "",
    about: "",
    social_platforms: "",
    instagram_followers: 0,
    facebook_followers: 0,
    tiktok_followers: 0,
    youtube_subscribers: 0,
    linkedin_followers: 0,
    x_followers: 0,
    total_followers: 0,
    authority_score: 0,
    buyerhqrank: "STARTER",
  };
}

export function normalizeSimplifiedBuyerhqrankRow(raw: Record<string, unknown>): SimplifiedBuyerhqrankRow {
  const template = buildSimplifiedBuyerhqrankTemplateRow();
  const row: SimplifiedBuyerhqrankRow = { ...template };

  row.agency_name = toText(raw.agency_name);
  row.state = toText(raw.state).toUpperCase();
  row.suburbs = toText(raw.suburbs);
  row.specialisations = toText(raw.specialisations);
  row.years_of_experience = toNonNegativeInt(raw.years_of_experience);
  row.properties_purchased = toNonNegativeInt(raw.properties_purchased);
  row.verified = normalizeVerified(raw.verified);
  row.profile_status = normalizeProfileStatus(raw.profile_status);
  row.claimed_at = toNullableText(raw.claimed_at);
  row.area_specialist = toText(raw.area_specialist);
  row.fee_structure = toText(raw.fee_structure);
  row.google_rating = toRating(raw.google_rating);
  row.google_reviews = toNonNegativeInt(raw.google_reviews);
  row.facebook_rating = toRating(raw.facebook_rating);
  row.facebook_reviews = toNonNegativeInt(raw.facebook_reviews);
  row.profile_description = toText(raw.profile_description);
  row.about = toText(raw.about);
  row.social_platforms = toText(raw.social_platforms);
  row.instagram_followers = toNonNegativeInt(raw.instagram_followers);
  row.facebook_followers = toNonNegativeInt(raw.facebook_followers);
  row.tiktok_followers = toNonNegativeInt(raw.tiktok_followers);
  row.youtube_subscribers = toNonNegativeInt(raw.youtube_subscribers);
  row.linkedin_followers = toNonNegativeInt(raw.linkedin_followers);
  row.x_followers = toNonNegativeInt(raw.x_followers);
  row.total_followers = toNonNegativeInt(raw.total_followers);
  row.authority_score = clamp(toNonNegativeInt(raw.authority_score), 0, 100);
  row.buyerhqrank = toText(raw.buyerhqrank) || "STARTER";

  return row;
}

export function applyBuyerhqrankToSimplifiedRow(row: SimplifiedBuyerhqrankRow, nowIso = new Date().toISOString()) {
  const computed = applyBuyerhqrankFields(
    {
      suburbs: csvToArray(row.suburbs),
      specialisations: csvToArray(row.specialisations),
      about: row.about || row.profile_description,
      fee_structure: row.fee_structure,
      profile_status: row.profile_status,
      verified: row.verified,
      claimed_at: row.claimed_at,
      instagram_followers: row.instagram_followers,
      facebook_followers: row.facebook_followers,
      tiktok_followers: row.tiktok_followers,
      youtube_subscribers: row.youtube_subscribers,
      linkedin_connections: 0,
      linkedin_followers: row.linkedin_followers,
      pinterest_followers: 0,
      x_followers: row.x_followers,
      snapchat_followers: 0,
      google_rating: row.google_rating,
      google_reviews: row.google_reviews,
      facebook_rating: row.facebook_rating,
      facebook_reviews: row.facebook_reviews,
      ratemyagent_rating: 0,
      ratemyagent_reviews: 0,
      trustpilot_rating: 0,
      trustpilot_reviews: 0,
      productreview_rating: 0,
      productreview_reviews: 0,
    },
    nowIso
  );

  return {
    ...row,
    social_platforms: buildSocialPlatformsLabel({
      instagram_followers: row.instagram_followers,
      facebook_followers: row.facebook_followers,
      tiktok_followers: row.tiktok_followers,
      youtube_subscribers: row.youtube_subscribers,
      linkedin_followers: row.linkedin_followers,
      x_followers: row.x_followers,
    }),
    total_followers: computed.total_followers,
    authority_score: computed.authority_score,
    buyerhqrank: computed.buyerhqrank,
    profile_status: computed.profile_status,
    verified: computed.verified,
    claimed_at: computed.claimed_at,
  };
}

function buildSocialPlatformsLabel(input: {
  instagram_followers: number;
  facebook_followers: number;
  tiktok_followers: number;
  youtube_subscribers: number;
  linkedin_followers: number;
  x_followers: number;
}) {
  const labels: string[] = [];
  if (input.instagram_followers > 0) labels.push("Instagram");
  if (input.facebook_followers > 0) labels.push("Facebook");
  if (input.tiktok_followers > 0) labels.push("TikTok");
  if (input.youtube_subscribers > 0) labels.push("YouTube");
  if (input.linkedin_followers > 0) labels.push("LinkedIn");
  if (input.x_followers > 0) labels.push("X");
  return labels.join(", ");
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNullableText(value: unknown) {
  const text = toText(value);
  return text || null;
}

function toNonNegativeInt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.trunc(value));
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }
  return 0;
}

function toRating(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return clamp(value, 0, 5);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? clamp(parsed, 0, 5) : 0;
  }
  return 0;
}

function normalizeVerified(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (verifiedValues.includes(normalized as (typeof verifiedValues)[number])) {
    return normalized as "Verified" | "Unverified";
  }
  return "Unverified";
}

function normalizeProfileStatus(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (profileStatusValues.includes(normalized as (typeof profileStatusValues)[number])) {
    return normalized as "Claimed" | "Unclaimed";
  }
  return "Unclaimed";
}

function csvToArray(value: string) {
  if (!value.trim()) return [];
  return value
    .split(/[,;|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
