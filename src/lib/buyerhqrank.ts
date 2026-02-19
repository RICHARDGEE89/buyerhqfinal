const LOG_SCALE = 1_000_000;
const RATING_SCALE = 1_000;
const REVIEW_REFERENCE_MAX = 5_000;

export const followerFields = [
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

export const reviewSourceFields = [
  { rating: "google_rating", reviews: "google_reviews" },
  { rating: "facebook_rating", reviews: "facebook_reviews" },
  { rating: "ratemyagent_rating", reviews: "ratemyagent_reviews" },
  { rating: "trustpilot_rating", reviews: "trustpilot_reviews" },
  { rating: "productreview_rating", reviews: "productreview_reviews" },
] as const;

export const socialMediaPresenceValues = ["A+", "A", "B+", "B", "C+", "C", "D+", "D"] as const;
export type SocialMediaPresence = (typeof socialMediaPresenceValues)[number];

export const profileStatusValues = ["Claimed", "Unclaimed"] as const;
export type ProfileStatus = (typeof profileStatusValues)[number];

export const verifiedValues = ["Verified", "Unverified"] as const;
export type VerifiedState = (typeof verifiedValues)[number];

export const buyerhqrankValues = [
  "ELITE+",
  "ELITE",
  "PREMIER",
  "ADVANCED",
  "ESTABLISHED",
  "ACTIVE",
  "DEVELOPING",
  "STARTER",
] as const;
export type BuyerhqRank = (typeof buyerhqrankValues)[number];

const socialScoreMap: Record<SocialMediaPresence, number> = {
  "A+": 40,
  A: 36,
  "B+": 32,
  B: 28,
  "C+": 22,
  C: 16,
  "D+": 10,
  D: 5,
};

const maxReviewRawPerSource = Math.round(5 * RATING_SCALE * Math.log1p(REVIEW_REFERENCE_MAX) * LOG_SCALE);
const maxReviewRawCombined = maxReviewRawPerSource * reviewSourceFields.length;

type MutableRow = Record<string, unknown>;

export type BuyerhqrankDerivedFields = {
  total_followers: number;
  social_media_presence: SocialMediaPresence;
  authority_score: number;
  buyerhqrank: BuyerhqRank;
  profile_status: ProfileStatus;
  verified: VerifiedState;
  claimed_at: string | null;
  last_updated: string;
};

export const systemManagedAgentFields = new Set([
  "total_followers",
  "authority_score",
  "buyerhqrank",
  "social_media_presence",
  "claimed_at",
  "last_updated",
]);

export const numericAgentFields = [
  ...followerFields,
  "years_experience",
  "properties_purchased",
  "avg_rating",
  "review_count",
  ...reviewSourceFields.flatMap((source) => [source.rating, source.reviews]),
] as const;

function isBlankValue(value: unknown) {
  return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function socialGradeFromFollowers(totalFollowers: number, allFieldsBlank: boolean): SocialMediaPresence {
  if (allFieldsBlank) return "D";
  if (totalFollowers >= 10_000) return "A+";
  if (totalFollowers >= 8_000) return "A";
  if (totalFollowers >= 6_000) return "B+";
  if (totalFollowers >= 4_000) return "B";
  if (totalFollowers >= 2_500) return "C+";
  if (totalFollowers >= 1_500) return "C";
  if (totalFollowers >= 750) return "D+";
  return "D";
}

function reviewScoreFromRow(row: MutableRow) {
  const rawTotal = reviewSourceFields.reduce((sum, source) => {
    const ratingScaled = Math.round(toRating(row[source.rating]) * RATING_SCALE);
    const reviewCount = toNonNegativeInt(row[source.reviews]);
    const logScaled = Math.round(Math.log1p(reviewCount) * LOG_SCALE);
    return sum + ratingScaled * logScaled;
  }, 0);

  if (rawTotal <= 0) return 0;
  const normalized = Math.round((rawTotal * 40) / maxReviewRawCombined);
  return clamp(normalized, 0, 40);
}

function completenessScoreFromRow(row: MutableRow) {
  let score = 0;
  if (parseStringArray(row.suburbs).length > 0) score += 5;
  if (parseStringArray(row.specializations).length > 0 || parseStringArray(row.specialisations).length > 0) score += 5;
  const hasAbout =
    (typeof row.about === "string" && row.about.trim().length > 0) ||
    (typeof row.bio === "string" && row.bio.trim().length > 0);
  if (hasAbout) score += 5;
  if (typeof row.fee_structure === "string" && row.fee_structure.trim()) score += 5;
  return score;
}

function rankFromAuthority(authorityScore: number): BuyerhqRank {
  if (authorityScore >= 90) return "ELITE+";
  if (authorityScore >= 80) return "ELITE";
  if (authorityScore >= 70) return "PREMIER";
  if (authorityScore >= 60) return "ADVANCED";
  if (authorityScore >= 50) return "ESTABLISHED";
  if (authorityScore >= 35) return "ACTIVE";
  if (authorityScore >= 20) return "DEVELOPING";
  return "STARTER";
}

function normalizeProfileStatus(value: unknown): ProfileStatus {
  if (value === "Claimed") return "Claimed";
  if (value === "Unclaimed") return "Unclaimed";
  return "Unclaimed";
}

function normalizeVerified(value: unknown, isVerifiedFallback: unknown): VerifiedState {
  if (value === "Verified" || value === "Unverified") return value;
  if (typeof isVerifiedFallback === "boolean") {
    return isVerifiedFallback ? "Verified" : "Unverified";
  }
  return "Unverified";
}

function normalizeClaimedAt(status: ProfileStatus, claimedAt: unknown, nowIso: string) {
  if (status !== "Claimed") return null;
  if (typeof claimedAt === "string" && claimedAt.trim()) return claimedAt;
  return nowIso;
}

export function normalizeBlankNumericFields<T extends Record<string, unknown>>(raw: T): T {
  const next = { ...raw } as MutableRow;
  for (const field of numericAgentFields) {
    if (isBlankValue(next[field])) {
      next[field] = 0;
    }
  }
  return next as T;
}

export function applyBuyerhqrankFields<T extends Record<string, unknown>>(
  raw: T,
  nowIso = new Date().toISOString()
): T & BuyerhqrankDerivedFields {
  const withNumericDefaults = normalizeBlankNumericFields(raw as Record<string, unknown>);
  const row = { ...withNumericDefaults } as MutableRow;

  const allFollowerInputsBlank = followerFields.every((field) => isBlankValue(raw[field]));
  const totalFollowers = followerFields.reduce((sum, field) => sum + toNonNegativeInt(row[field]), 0);
  const socialMediaPresence = socialGradeFromFollowers(totalFollowers, allFollowerInputsBlank);
  const socialScore = socialScoreMap[socialMediaPresence];
  const reviewScore = reviewScoreFromRow(row);
  const completenessScore = completenessScoreFromRow(row);
  const authorityScore = clamp(Math.round(socialScore + reviewScore + completenessScore), 0, 100);
  const badge = rankFromAuthority(authorityScore);

  const profileStatus = normalizeProfileStatus(row.profile_status);
  const verified = normalizeVerified(row.verified, row.is_verified);
  const claimedAt = normalizeClaimedAt(profileStatus, row.claimed_at, nowIso);
  const finalVerified = profileStatus === "Claimed" ? "Verified" : verified;

  row.total_followers = totalFollowers;
  row.social_media_presence = socialMediaPresence;
  row.authority_score = authorityScore;
  row.buyerhqrank = badge;
  row.profile_status = profileStatus;
  row.verified = finalVerified;
  row.is_verified = finalVerified === "Verified";
  row.claimed_at = claimedAt;
  row.last_updated = nowIso;

  return row as T & BuyerhqrankDerivedFields;
}
