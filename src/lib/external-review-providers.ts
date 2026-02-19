import type { AgencyReviewSourceRow, Json } from "@/lib/database.types";

export type NormalizedExternalReview = {
  externalReviewId: string;
  rating: number;
  reviewerName: string | null;
  reviewerAvatarUrl: string | null;
  reviewText: string | null;
  reviewUrl: string | null;
  reviewedAt: string | null;
  helpfulCount: number | null;
  metadata: Json;
};

const SOURCE_TRUST_WEIGHTS: Record<AgencyReviewSourceRow["source"], number> = {
  google_places: 1,
  trustpilot: 0.95,
  rate_my_agent: 0.9,
  facebook: 0.8,
  manual: 0.6,
};

export function sourceTrustWeight(source: AgencyReviewSourceRow["source"]) {
  return SOURCE_TRUST_WEIGHTS[source] ?? 0.5;
}

function asIsoDate(value: unknown) {
  if (!value) return null;
  if (typeof value === "number") {
    const ms = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

function normalizeRating(value: unknown) {
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(Math.max(numeric, 0), 5);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function fetchGooglePlacesReviews(source: AgencyReviewSourceRow): Promise<NormalizedExternalReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  const placeId = source.external_id.trim();
  if (!placeId) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "reviews,url");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    result?: {
      url?: string;
      reviews?: Array<{
        author_name?: string;
        profile_photo_url?: string;
        text?: string;
        rating?: number;
        time?: number;
        author_url?: string;
      }>;
    };
  };

  const fallbackUrl = payload.result?.url ?? source.external_url ?? null;
  return (payload.result?.reviews ?? []).map((review, index) => ({
    externalReviewId: `${placeId}-${review.time ?? "na"}-${review.author_name ?? index}`,
    rating: normalizeRating(review.rating),
    reviewerName: normalizeText(review.author_name) || null,
    reviewerAvatarUrl: normalizeText(review.profile_photo_url) || null,
    reviewText: normalizeText(review.text) || null,
    reviewUrl: normalizeText(review.author_url) || fallbackUrl,
    reviewedAt: asIsoDate(review.time),
    helpfulCount: null,
    metadata: {
      provider: "google_places",
      raw_time: review.time ?? null,
    },
  }));
}

async function fetchTrustpilotReviews(source: AgencyReviewSourceRow): Promise<NormalizedExternalReview[]> {
  const apiKey = process.env.TRUSTPILOT_API_KEY;
  if (!apiKey) return [];

  const unitId = source.external_id.trim();
  if (!unitId) return [];

  const baseUrl = process.env.TRUSTPILOT_API_BASE_URL ?? "https://api.trustpilot.com/v1";
  const url = `${baseUrl}/business-units/${encodeURIComponent(unitId)}/reviews?perPage=20&page=1`;
  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as {
    reviews?: Array<{
      id?: string;
      stars?: number;
      text?: string;
      title?: string;
      createdAt?: string;
      consumer?: { displayName?: string };
      links?: { review?: string };
    }>;
  };

  return (payload.reviews ?? []).map((review, index) => ({
    externalReviewId: normalizeText(review.id) || `${unitId}-${index}`,
    rating: normalizeRating(review.stars),
    reviewerName: normalizeText(review.consumer?.displayName) || null,
    reviewerAvatarUrl: null,
    reviewText: [normalizeText(review.title), normalizeText(review.text)].filter(Boolean).join(" — ") || null,
    reviewUrl: normalizeText(review.links?.review) || source.external_url || null,
    reviewedAt: asIsoDate(review.createdAt),
    helpfulCount: null,
    metadata: {
      provider: "trustpilot",
    },
  }));
}

async function fetchJsonFeedReviews(source: AgencyReviewSourceRow): Promise<NormalizedExternalReview[]> {
  const jsonFeedUrl =
    normalizeText(source.external_url) ||
    (typeof source.metadata === "object" && source.metadata && "feed_url" in source.metadata
      ? normalizeText((source.metadata as Record<string, unknown>).feed_url)
      : "");
  if (!jsonFeedUrl) return [];

  const response = await fetch(jsonFeedUrl, { cache: "no-store" });
  if (!response.ok) return [];
  const payload = (await response.json()) as {
    reviews?: Array<Record<string, unknown>>;
  };

  const rows = Array.isArray(payload) ? payload : payload.reviews ?? [];
  if (!Array.isArray(rows)) return [];

  return rows.slice(0, 50).map((row, index) => {
    const reviewId = normalizeText(row.id) || normalizeText(row.review_id) || `${source.external_id}-${index}`;
    return {
      externalReviewId: reviewId,
      rating: normalizeRating(row.rating),
      reviewerName: normalizeText(row.reviewer_name || row.author_name) || null,
      reviewerAvatarUrl: normalizeText(row.reviewer_avatar_url || row.profile_photo_url) || null,
      reviewText: normalizeText(row.text || row.comment || row.review_text) || null,
      reviewUrl: normalizeText(row.url || row.review_url) || source.external_url || null,
      reviewedAt: asIsoDate(row.reviewed_at || row.created_at || row.timestamp),
      helpfulCount:
        typeof row.helpful_count === "number" ? row.helpful_count : Number.parseInt(String(row.helpful_count), 10) || null,
      metadata: {
        provider: source.source,
        raw: row as Json,
      },
    };
  });
}

export async function fetchSourceReviews(source: AgencyReviewSourceRow): Promise<NormalizedExternalReview[]> {
  if (!source.is_active) return [];

  if (source.source === "google_places") {
    return fetchGooglePlacesReviews(source);
  }
  if (source.source === "trustpilot") {
    return fetchTrustpilotReviews(source);
  }

  // rate_my_agent, facebook, and manual can all use the same JSON feed fallback.
  return fetchJsonFeedReviews(source);
}
