import { cache } from "react";

import type { StateCode } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const getHomepageStats = cache(async () => {
  const supabase = createClient();

  const { count: verifiedAgents } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)
    .eq("is_active", true);

  const { data: statesData } = await supabase
    .from("agents")
    .select("state")
    .eq("is_verified", true)
    .eq("is_active", true);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { count: enquiriesMtd } = await supabase
    .from("enquiries")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart.toISOString());

  return {
    verifiedAgents: verifiedAgents ?? 0,
    statesCovered: new Set((statesData ?? []).map((item) => item.state).filter(Boolean)).size,
    enquiriesMtd: enquiriesMtd ?? 0,
    avgResponseTime: "< 2hrs",
  };
});

export const getFeaturedAgents = cache(async () => {
  const supabase = createClient();
  const { data } = await supabase
    .from("agents")
    .select("*")
    .eq("is_verified", true)
    .eq("is_active", true)
    .order("avg_rating", { ascending: false, nullsFirst: false })
    .limit(6);
  return data ?? [];
});

export const getStateAgentCounts = cache(async () => {
  const supabase = createClient();
  const states: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

  const entries = await Promise.all(
    states.map(async (state) => {
      const { count } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("state", state)
        .eq("is_verified", true)
        .eq("is_active", true);
      return [state, count ?? 0] as const;
    })
  );

  return Object.fromEntries(entries) as Record<string, number>;
});

export const getPublishedBlogPosts = cache(async () => {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  return data ?? [];
});

export const getPublishedBlogPostBySlug = cache(async (slug: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data;
});
