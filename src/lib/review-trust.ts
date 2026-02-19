import type { ExternalReviewRow, ReviewRow } from "@/lib/database.types";

const sourceWeight: Record<ExternalReviewRow["source"], number> = {
  google_places: 1,
  trustpilot: 0.95,
  rate_my_agent: 0.9,
  facebook: 0.8,
  manual: 0.6,
};

export type ReviewSourceBadge = {
  source: ExternalReviewRow["source"];
  label: string;
  count: number;
  avgRating: number;
};

export type TrustScoreSummary = {
  score: number;
  sourceBadges: ReviewSourceBadge[];
  approvedExternalCount: number;
  approvedInternalCount: number;
};

function sourceLabel(source: ExternalReviewRow["source"]) {
  switch (source) {
    case "google_places":
      return "Google";
    case "trustpilot":
      return "Trustpilot";
    case "rate_my_agent":
      return "RateMyAgent";
    case "facebook":
      return "Facebook";
    default:
      return "Verified Source";
  }
}

export function buildTrustScoreSummary(params: {
  externalReviews: ExternalReviewRow[];
  internalReviews: ReviewRow[];
}): TrustScoreSummary {
  const approvedExternal = params.externalReviews.filter((item) => item.is_approved && !item.is_hidden);
  const approvedInternal = params.internalReviews.filter((item) => item.is_approved);

  if (approvedExternal.length === 0 && approvedInternal.length === 0) {
    return {
      score: 0,
      sourceBadges: [],
      approvedExternalCount: 0,
      approvedInternalCount: 0,
    };
  }

  const bySource = new Map<
    ExternalReviewRow["source"],
    {
      count: number;
      weightedRating: number;
      weightTotal: number;
    }
  >();

  approvedExternal.forEach((review) => {
    const source = review.source;
    const weight = (typeof review.trust_weight === "number" ? review.trust_weight : sourceWeight[source]) || 0.5;
    const current = bySource.get(source) ?? { count: 0, weightedRating: 0, weightTotal: 0 };
    current.count += 1;
    current.weightedRating += review.rating * weight;
    current.weightTotal += weight;
    bySource.set(source, current);
  });

  const sourceBadges = Array.from(bySource.entries())
    .map(([source, stat]) => ({
      source,
      label: sourceLabel(source),
      count: stat.count,
      avgRating: stat.weightTotal > 0 ? stat.weightedRating / stat.weightTotal : 0,
    }))
    .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating);

  const externalWeighted = approvedExternal.reduce((sum, review) => {
    const weight = (typeof review.trust_weight === "number" ? review.trust_weight : sourceWeight[review.source]) || 0.5;
    return sum + review.rating * weight;
  }, 0);
  const externalWeightTotal = approvedExternal.reduce((sum, review) => {
    const weight = (typeof review.trust_weight === "number" ? review.trust_weight : sourceWeight[review.source]) || 0.5;
    return sum + weight;
  }, 0);
  const externalAvg = externalWeightTotal > 0 ? externalWeighted / externalWeightTotal : 0;

  const internalAvg =
    approvedInternal.length > 0
      ? approvedInternal.reduce((sum, review) => sum + review.rating, 0) / approvedInternal.length
      : 0;

  const mixedAvg =
    approvedExternal.length > 0 && approvedInternal.length > 0
      ? externalAvg * 0.8 + internalAvg * 0.2
      : approvedExternal.length > 0
        ? externalAvg
        : internalAvg;

  const ratingComponent = (mixedAvg / 5) * 70;
  const volumeComponent = Math.min(15, Math.log10(approvedExternal.length + approvedInternal.length + 1) * 10);
  const diversityComponent = Math.min(15, bySource.size * 4);
  const score = Math.round(Math.min(100, Math.max(0, ratingComponent + volumeComponent + diversityComponent)));

  return {
    score,
    sourceBadges,
    approvedExternalCount: approvedExternal.length,
    approvedInternalCount: approvedInternal.length,
  };
}
