import { agentIsActive, agentIsVerified, normalizeAgents, sanitizePublicAgents } from "@/lib/agent-compat";
import type { AgentRow, StateCode } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export async function getHomepageStats() {
  const supabase = createClient();
  const { data: agentsData } = await supabase.from("agents").select("*");

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count: enquiriesMtd } = await supabase
    .from("enquiries")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());

  const agents = normalizeAgents((agentsData ?? []) as AgentRow[]);
  const visibleAgents = agents.filter((agent) => agentIsActive(agent) && agentIsVerified(agent));

  return {
    verifiedAgents: visibleAgents.length,
    statesCovered: new Set(visibleAgents.map((item) => item.state).filter(Boolean)).size,
    enquiriesMtd: enquiriesMtd ?? 0,
    avgResponseTime: "< 2hrs",
  };
}

export async function getFeaturedAgents() {
  const supabase = createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(100);

  const visible = normalizeAgents((data ?? []) as AgentRow[]).filter(
    (agent) => agentIsActive(agent) && agentIsVerified(agent)
  );
  return sanitizePublicAgents(visible.slice(0, 6));
}

export async function getStateAgentCounts() {
  const supabase = createClient();
  const states: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
  const { data } = await supabase.from("agents").select("*");
  const visible = normalizeAgents((data ?? []) as AgentRow[]).filter(
    (agent) => agentIsActive(agent) && agentIsVerified(agent)
  );
  const counts = Object.fromEntries(states.map((state) => [state, 0])) as Record<string, number>;
  visible.forEach((agent) => {
    if (agent.state && counts[agent.state] !== undefined) {
      counts[agent.state] += 1;
    }
  });
  return counts;
}

export async function getPublishedBlogPosts() {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
}

export async function getPublishedBlogPostBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
}
