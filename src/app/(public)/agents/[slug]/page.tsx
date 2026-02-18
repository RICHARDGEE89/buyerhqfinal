import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AgentProfileContent from "./AgentProfileContent";
import { createClient } from "@/lib/supabase/server";

type Params = { slug: string };

async function getAgentWithReviews(id: string) {
  const supabase = createClient();
  const { data: agent } = await supabase.from("agents").select("*").eq("id", id).single();
  if (!agent) return null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("agent_id", id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  return {
    agent,
    reviews: reviews ?? [],
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
      `${result.agent.name} profile, specialisations, reviews, and enquiry options on BuyerHQ.`,
  };
}

export default async function AgentProfilePage({ params }: { params: Params }) {
  const result = await getAgentWithReviews(params.slug);
  if (!result) notFound();

  return <AgentProfileContent agent={result.agent} reviews={result.reviews} />;
}
