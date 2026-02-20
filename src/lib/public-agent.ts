import type { AgentRow } from "@/lib/database.types";
import { normalizeAgent } from "@/lib/agent-compat";

export type PublicAgentView = {
  id: string;
  name: string;
  company: string;
  state: string;
  suburb: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  specialisations: string[];
  feeStructure: string;
  verified: boolean;
  featured: boolean;
  rankScore: number;
  bio: string;
  suburbsCovered: string[];
  avatar: string;
  minFee: number;
  responseTime: string;
  dealsCompleted: number;
  slug: string;
};

function buildAvatarUrl(id: string, name: string) {
  const seed = encodeURIComponent((name || id).toLowerCase().replace(/\s+/g, "-"));
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundType=gradientLinear`;
}

function parseMinFee(feeStructure: string | null) {
  if (!feeStructure) return 0;
  const match = feeStructure.match(/(\d[\d,]*)/);
  if (!match) return 0;
  const parsed = Number.parseInt(match[1].replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function estimateResponseTime(authorityScore: number) {
  if (authorityScore >= 85) return "< 2 hrs";
  if (authorityScore >= 70) return "< 4 hrs";
  if (authorityScore >= 55) return "< 6 hrs";
  return "< 12 hrs";
}

export function computeBuyerHQScore(agent: AgentRow) {
  const normalized = normalizeAgent(agent);
  const authority = typeof normalized.authority_score === "number" ? normalized.authority_score : 0;
  const rating = typeof normalized.avg_rating === "number" ? normalized.avg_rating : 0;
  const reviews = typeof normalized.review_count === "number" ? normalized.review_count : 0;
  const experience = typeof normalized.years_experience === "number" ? normalized.years_experience : 0;

  const authorityPart = Math.round(authority * 0.55);
  const ratingPart = Math.round((rating / 5) * 25);
  const reviewPart = Math.round(Math.min(reviews, 500) / 500 * 10);
  const experiencePart = Math.round(Math.min(experience, 20) / 20 * 10);
  return Math.max(0, Math.min(100, authorityPart + ratingPart + reviewPart + experiencePart));
}

export function scoreLabel(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 78) return "Premier";
  if (score >= 62) return "Advanced";
  return "Established";
}

export function toPublicAgentView(agent: AgentRow): PublicAgentView {
  const normalized = normalizeAgent(agent);
  const suburbsCovered = normalized.suburbs ?? [];
  const suburb = suburbsCovered[0] ?? "Australia";
  const authorityScore = typeof normalized.authority_score === "number" ? normalized.authority_score : 0;

  return {
    id: normalized.id,
    name: normalized.name,
    company: normalized.agency_name ?? "Independent Buyer's Agent",
    state: normalized.state ?? "AU",
    suburb,
    rating: normalized.avg_rating ?? 0,
    reviewCount: normalized.review_count ?? 0,
    yearsExperience: normalized.years_experience ?? 0,
    specialisations: normalized.specializations ?? [],
    feeStructure: normalized.fee_structure ?? "Fee on consultation",
    verified: normalized.is_verified,
    featured: authorityScore >= 80,
    rankScore: authorityScore,
    bio:
      (normalized.bio ?? normalized.about ?? "").trim() ||
      "Verified buyer's agent profile on BuyerHQ.",
    suburbsCovered,
    avatar: normalized.avatar_url ?? buildAvatarUrl(normalized.id, normalized.name),
    minFee: parseMinFee(normalized.fee_structure),
    responseTime: estimateResponseTime(authorityScore),
    dealsCompleted: normalized.properties_purchased ?? 0,
    slug: normalized.slug ?? normalized.id,
  };
}

export function toPublicAgentViews(agents: AgentRow[]) {
  return agents.map(toPublicAgentView);
}
