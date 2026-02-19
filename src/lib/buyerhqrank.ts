export const verifiedValues = ["Verified", "Unverified"] as const;
export const profileStatusValues = ["Claimed", "Unclaimed"] as const;
export const socialMediaPresenceValues = ["A+", "A", "B+", "B", "C+", "C", "D+", "D"] as const;

const followerFields = [
  "instagram_followers",
  "facebook_followers",
  "tiktok_followers",
  "youtube_subscribers",
  "linkedin_connections",
  "linkedin_followers",
  "pinterest_followers",
  "x_followers",
  "snapchat_followers",
] as const;

const reviewPairs = [
  ["google_rating", "google_reviews"],
  ["facebook_rating", "facebook_reviews"],
  ["ratemyagent_rating", "ratemyagent_reviews"],
  ["trustpilot_rating", "trustpilot_reviews"],
  ["productreview_rating", "productreview_reviews"],
] as const;

const socialScoreMap: Record<(typeof socialMediaPresenceValues)[number], number> = {
  "A+": 40,
  A: 36,
  "B+": 32,
  B: 28,
  "C+": 22,
  C: 16,
  "D+": 10,
  D: 5,
};

const authorityRankLevels = [
  { min: 90, rank: "ELITE+" },
  { min: 80, rank: "ELITE" },
  { min: 70, rank: "PREMIER" },
  { min: 60, rank: "ADVANCED" },
  { min: 50, rank: "ESTABLISHED" },
  { min: 35, rank: "ACTIVE" },
  { min: 20, rank: "DEVELOPING" },
] as const;

export type BuyerhqrankDerivedFields = {
  social_media_presence: (typeof socialMediaPresenceValues)[number];
  total_followers: number;
  authority_score: number;
  buyerhqrank: string;
  verified: (typeof verifiedValues)[number];
  profile_status: (typeof profileStatusValues)[number];
  claimed_at: string | null;
  last_updated: string;
};

export function applyBuyerhqrankFields<T extends Record<string, unknown>>(
  raw: T,
  nowIso = new Date().toISOString()
): T & BuyerhqrankDerivedFields {
  const followerValues = followerFields.map((field) => toNonNegativeInt(raw[field]));
  const totalFollowers = followerValues.reduce((sum, value) => sum + value, 0);
  const allFollowersBlank = followerFields.every((field) => isBlank(raw[field]));
  const socialMediaPresence = computeSocialPresence(totalFollowers, allFollowersBlank);
  const socialScore = socialScoreMap[socialMediaPresence];

  const reviewRaw = reviewPairs.reduce((sum, [ratingKey, countKey]) => {
    const rating = clamp(toRating(raw[ratingKey]), 0, 5);
    const count = toNonNegativeInt(raw[countKey]);
    return sum + rating * Math.log1p(count);
  }, 0);
  const reviewMaxRaw = reviewPairs.length * (5 * Math.log1p(2500));
  const reviewScore = clamp(Math.round((reviewRaw / reviewMaxRaw) * 40), 0, 40);

  const completenessScore =
    (hasContent(raw.suburbs) ? 5 : 0) +
    (hasContent(raw.specialisations) || hasContent(raw.specializations) ? 5 : 0) +
    (hasContent(raw.about) ? 5 : 0) +
    (hasContent(raw.fee_structure) ? 5 : 0);

  const authorityScore = clamp(socialScore + reviewScore + completenessScore, 0, 100);
  const rank = computeBuyerhqrank(authorityScore);

  let profileStatus = normalizeProfileStatus(raw.profile_status);
  let verified = normalizeVerified(raw.verified);
  let claimedAt = toNullableText(raw.claimed_at);

  if (profileStatus === "Claimed") {
    verified = "Verified";
    claimedAt = claimedAt ?? nowIso;
  } else {
    profileStatus = "Unclaimed";
    claimedAt = null;
  }

  return {
    ...raw,
    social_media_presence: socialMediaPresence,
    total_followers: totalFollowers,
    authority_score: authorityScore,
    buyerhqrank: rank,
    verified,
    profile_status: profileStatus,
    claimed_at: claimedAt,
    last_updated: nowIso,
  };
}

function computeSocialPresence(totalFollowers: number, allFollowersBlank: boolean) {
  if (allFollowersBlank) return "D" as const;
  if (totalFollowers >= 10000) return "A+" as const;
  if (totalFollowers >= 8000) return "A" as const;
  if (totalFollowers >= 6000) return "B+" as const;
  if (totalFollowers >= 4000) return "B" as const;
  if (totalFollowers >= 2500) return "C+" as const;
  if (totalFollowers >= 1500) return "C" as const;
  if (totalFollowers >= 750) return "D+" as const;
  return "D" as const;
}

function computeBuyerhqrank(authorityScore: number) {
  for (const item of authorityRankLevels) {
    if (authorityScore >= item.min) {
      return item.rank;
    }
  }
  return "STARTER";
}

function normalizeVerified(value: unknown): (typeof verifiedValues)[number] {
  const normalized = toText(value);
  if (verifiedValues.includes(normalized as (typeof verifiedValues)[number])) {
    return normalized as (typeof verifiedValues)[number];
  }
  return "Unverified";
}

function normalizeProfileStatus(value: unknown): (typeof profileStatusValues)[number] {
  const normalized = toText(value);
  if (profileStatusValues.includes(normalized as (typeof profileStatusValues)[number])) {
    return normalized as (typeof profileStatusValues)[number];
  }
  return "Unclaimed";
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
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function isBlank(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

function hasContent(value: unknown) {
  if (Array.isArray(value)) {
    return value.some((item) => toText(item).length > 0);
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return false;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
