import { applyBuyerhqrankFields, profileStatusValues, socialMediaPresenceValues, verifiedValues } from "@/lib/buyerhqrank";

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
  "productreview_rating",
  "productreview_reviews",
  "trustpilot_rating",
  "trustpilot_reviews",
  "ratemyagent_rating",
  "ratemyagent_reviews",
  "profile_description",
  "about",
  "social_media_presence",
  "total_followers",
  "authority_score",
  "instagram_followers",
  "facebook_followers",
  "tiktok_followers",
  "youtube_subscribers",
  "linkedin_connections",
  "linkedin_followers",
  "pinterest_followers",
  "x_followers",
  "snapchat_followers",
  "last_updated",
] as const;

export const universalAgentUploadHeadings = [
  "Agent Name",
  "Agency Name",
  "Address",
  "Website",
  "Phone",
  "Google Rating",
  "Google Reviews",
  "Specialist",
  "Area",
  "About Agency",
  "Agent Bio",
  "Experience",
  "Properties",
  "Fee Structure",
  "BuyerHQ Rank",
  "Social Media Score",
  "Facebook Rating",
  "Facebook Reviews",
  "TikTok Followers",
  "Instagram Followers",
  "Youtube Followers",
  "Total Followers",
] as const;

export type UniversalAgentUploadHeading = (typeof universalAgentUploadHeadings)[number];
export type UniversalAgentUploadRow = Record<UniversalAgentUploadHeading, string | number>;

export function buildUniversalAgentUploadTemplateRow(): UniversalAgentUploadRow {
  return {
    "Agent Name": "",
    "Agency Name": "",
    Address: "",
    Website: "",
    Phone: "",
    "Google Rating": 0,
    "Google Reviews": 0,
    Specialist: "",
    Area: "",
    "About Agency": "",
    "Agent Bio": "",
    Experience: 0,
    Properties: 0,
    "Fee Structure": "",
    "BuyerHQ Rank": "STARTER",
    "Social Media Score": "D",
    "Facebook Rating": 0,
    "Facebook Reviews": 0,
    "TikTok Followers": 0,
    "Instagram Followers": 0,
    "Youtube Followers": 0,
    "Total Followers": 0,
  };
}

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
  productreview_rating: number;
  productreview_reviews: number;
  trustpilot_rating: number;
  trustpilot_reviews: number;
  ratemyagent_rating: number;
  ratemyagent_reviews: number;
  profile_description: string;
  about: string;
  social_media_presence: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D+" | "D";
  total_followers: number;
  authority_score: number;
  instagram_followers: number;
  facebook_followers: number;
  tiktok_followers: number;
  youtube_subscribers: number;
  linkedin_connections: number;
  linkedin_followers: number;
  pinterest_followers: number;
  x_followers: number;
  snapchat_followers: number;
  last_updated: string;
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
    productreview_rating: 0,
    productreview_reviews: 0,
    trustpilot_rating: 0,
    trustpilot_reviews: 0,
    ratemyagent_rating: 0,
    ratemyagent_reviews: 0,
    profile_description: "",
    about: "",
    social_media_presence: "D",
    total_followers: 0,
    authority_score: 0,
    instagram_followers: 0,
    facebook_followers: 0,
    tiktok_followers: 0,
    youtube_subscribers: 0,
    linkedin_connections: 0,
    linkedin_followers: 0,
    pinterest_followers: 0,
    x_followers: 0,
    snapchat_followers: 0,
    last_updated: "",
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
  row.productreview_rating = toRating(raw.productreview_rating);
  row.productreview_reviews = toNonNegativeInt(raw.productreview_reviews);
  row.trustpilot_rating = toRating(raw.trustpilot_rating);
  row.trustpilot_reviews = toNonNegativeInt(raw.trustpilot_reviews);
  row.ratemyagent_rating = toRating(raw.ratemyagent_rating);
  row.ratemyagent_reviews = toNonNegativeInt(raw.ratemyagent_reviews);
  row.profile_description = toText(raw.profile_description);
  row.about = toText(raw.about);
  row.social_media_presence = normalizeSocialPresence(raw.social_media_presence);
  row.total_followers = toNonNegativeInt(raw.total_followers);
  row.authority_score = clamp(toNonNegativeInt(raw.authority_score), 0, 100);
  row.instagram_followers = toNonNegativeInt(raw.instagram_followers);
  row.facebook_followers = toNonNegativeInt(raw.facebook_followers);
  row.tiktok_followers = toNonNegativeInt(raw.tiktok_followers);
  row.youtube_subscribers = toNonNegativeInt(raw.youtube_subscribers);
  row.linkedin_connections = toNonNegativeInt(raw.linkedin_connections);
  row.linkedin_followers = toNonNegativeInt(raw.linkedin_followers);
  row.pinterest_followers = toNonNegativeInt(raw.pinterest_followers);
  row.x_followers = toNonNegativeInt(raw.x_followers);
  row.snapchat_followers = toNonNegativeInt(raw.snapchat_followers);
  row.last_updated = toText(raw.last_updated);

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
      linkedin_connections: row.linkedin_connections,
      linkedin_followers: row.linkedin_followers,
      pinterest_followers: row.pinterest_followers,
      x_followers: row.x_followers,
      snapchat_followers: row.snapchat_followers,
      google_rating: row.google_rating,
      google_reviews: row.google_reviews,
      facebook_rating: row.facebook_rating,
      facebook_reviews: row.facebook_reviews,
      ratemyagent_rating: row.ratemyagent_rating,
      ratemyagent_reviews: row.ratemyagent_reviews,
      trustpilot_rating: row.trustpilot_rating,
      trustpilot_reviews: row.trustpilot_reviews,
      productreview_rating: row.productreview_rating,
      productreview_reviews: row.productreview_reviews,
    },
    nowIso
  );

  return {
    ...row,
    social_media_presence: computed.social_media_presence,
    total_followers: computed.total_followers,
    authority_score: computed.authority_score,
    profile_status: computed.profile_status,
    verified: computed.verified,
    claimed_at: computed.claimed_at,
    last_updated: computed.last_updated,
  };
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

function normalizeSocialPresence(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (socialMediaPresenceValues.includes(normalized as (typeof socialMediaPresenceValues)[number])) {
    return normalized as SimplifiedBuyerhqrankRow["social_media_presence"];
  }
  return "D";
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
