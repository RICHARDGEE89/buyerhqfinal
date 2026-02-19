import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AgentProfileContent from "./AgentProfileContent";
import { sanitizePublicAgent } from "@/lib/agent-compat";
import type { AgentRow, ExternalReviewRow } from "@/lib/database.types";
import { isMissingRelationError } from "@/lib/db-errors";
import { createClient } from "@/lib/supabase/server";

type Params = { slug: string };

async function getAgentWithReviews(identifier: string) {
  const supabase = createClient();
  let agent: AgentRow | null = null;

  const byIdResult = await supabase.from("agents").select("*").eq("id", identifier).maybeSingle();
  if (byIdResult.data) {
    agent = byIdResult.data as AgentRow;
  }

  if (!agent) {
    const bySlugResult = await supabase.from("agents").select("*").eq("slug", identifier).maybeSingle();
    if (!bySlugResult.error && bySlugResult.data) {
      agent = bySlugResult.data as AgentRow;
    }
  }

  if (!agent) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("agent_id", agent.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const externalResult = await supabase
    .from("external_reviews")
    .select("*")
    .eq("agent_id", agent.id)
    .eq("is_approved", true)
    .eq("is_hidden", false)
    .order("reviewed_at", { ascending: false, nullsFirst: false });

  const externalReviews =
    externalResult.error && isMissingRelationError(externalResult.error.message, "external_reviews")
      ? []
      : ((externalResult.data ?? []) as ExternalReviewRow[]);

  return {
    agent: sanitizePublicAgent(agent),
    reviews: reviews ?? [],
    externalReviews,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const result = await getAgentWithReviews(params.slug);
  if (!result) {
    return { title: "Agent Not Found | BuyerHQ", description: "The requested profile was not found." };
  }

  return {
    title: `${result.agent.name} | BuyerHQ`,
    description:
      result.agent.bio ??
      `${result.agent.name} profile, specialisations, reviews, and brokered enquiry support on BuyerHQ.`,
  };
}

export default async function AgentProfilePage({ params }: { params: Params }) {
  const result = await getAgentWithReviews(params.slug);
  if (!result) notFound();

  return (
    <AgentProfileContent
      agent={result.agent}
      reviews={result.reviews}
      externalReviews={result.externalReviews}
    />
  );
}
