import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Shield, Star } from "lucide-react";

import { CTABanner } from "@/components/CTABanner";
import { ConversationalQuiz } from "@/components/ConversationalQuiz";
import { DirectAgentCard } from "@/components/DirectAgentCard";
import { toPublicAgentViews } from "@/lib/public-agent";
import {
  getFeaturedAgents,
  getHomepageStats,
  getPublishedBlogPosts,
  getStateAgentCounts,
} from "@/lib/server-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Home | BuyerHQ",
  description:
    "Find verified buyer's agents across Australia. Compare specialties, pricing, and reviews in one place.",
};

const stateNameMap: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
};

export default async function HomePage() {
  const supabase = createClient();
  const [stats, featuredAgentsRaw, stateCounts, posts, reviewRows] = await Promise.all([
    getHomepageStats(),
    getFeaturedAgents(),
    getStateAgentCounts(),
    getPublishedBlogPosts(),
    supabase
      .from("reviews")
      .select("id,buyer_name,rating,comment,property_type,agent_id,agents(name,state)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);
  const featuredAgents = toPublicAgentViews(featuredAgentsRaw);
  const testimonials = (reviewRows.data ?? []).map((review) => {
    const relation = Array.isArray(review.agents) ? review.agents[0] : review.agents;
    return {
      id: review.id,
      buyer_name: review.buyer_name ?? "Verified buyer",
      rating: review.rating,
      comment: review.comment ?? "Verified review submitted on BuyerHQ.",
      property_type: review.property_type ?? "Property purchase",
      agent_name: relation?.name ?? "Verified agent",
      state: relation?.state ?? "AU",
    };
  });

  return (
    <>
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-navy">
        <div className="absolute inset-0 gradient-hero" />
        <div className="relative z-10 container mx-auto space-y-8 px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/85">
            <Shield className="h-4 w-4 text-white/60" />
            Australia&apos;s Independent Buyer&apos;s Agent Directory
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
            Find Your <span className="text-white/50">Perfect</span> Buyer&apos;s Agent
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
            Verified review intelligence and negotiated fee outcomes in one place. 100% buyer-focused.
          </p>

          <form action="/find-agents" method="get" className="mx-auto max-w-xl">
            <div className="flex gap-2 rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  name="search"
                  placeholder="Suburb, postcode or agent name..."
                  className="w-full border-0 bg-transparent pl-9 text-white placeholder:text-white/45 focus:outline-none"
                />
              </div>
              <button className="rounded-md bg-white px-4 py-2 font-semibold text-navy transition-colors hover:bg-white/90">
                Find Agents
              </button>
            </div>
            <p className="mt-2 text-xs text-white/40">Or take our 3-minute Match Quiz for a personalised shortlist</p>
          </form>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/find-agents"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Browse All Agents <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/match-quiz"
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-5 py-3 text-white transition-colors hover:bg-white/20"
            >
              Take the Match Quiz
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="space-y-2 text-center">
              <div className="font-display text-4xl font-bold text-navy">{stats.verifiedAgents.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Verified Agents</div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-display text-4xl font-bold text-navy">{stats.statesCovered}/8</div>
              <div className="text-sm text-muted-foreground">States Covered</div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-display text-4xl font-bold text-navy">{stats.enquiriesMtd.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Enquiries This Month</div>
            </div>
            <div className="space-y-2 text-center">
              <div className="font-display text-4xl font-bold text-navy">{stats.avgResponseTime}</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Top Rated</p>
              <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Featured Agents</h2>
            </div>
            <Link
              href="/find-agents"
              className="hidden items-center text-sm font-medium text-foreground transition-colors hover:text-navy md:inline-flex"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAgents.slice(0, 4).map((agent) => (
              <DirectAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Social Proof</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">What Buyers Say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.id} className="flex flex-col rounded-lg border border-border bg-card p-6 shadow-card">
                <p className="mb-4 flex items-center gap-1 text-foreground">
                  {Array.from({ length: Math.max(1, Math.min(5, Math.round(item.rating))) }, (_, index) => (
                    <Star key={`${item.id}-${index}`} className="h-3.5 w-3.5 fill-foreground" />
                  ))}
                </p>
                <blockquote className="mb-5 flex-1 text-sm italic leading-relaxed text-foreground">
                  &quot;{item.comment}&quot;
                </blockquote>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-navy">{item.buyer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.property_type} · {item.state}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Reviewed agent: {item.agent_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">National Coverage</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Find Agents in Your State</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(stateNameMap).map(([stateCode, stateName]) => (
              <Link
                key={stateCode}
                href={`/find-agents?state=${stateCode}`}
                className="group rounded-lg border border-border bg-background p-5 text-center transition-all hover:border-navy hover:shadow-card-hover"
              >
                <div className="font-display text-2xl font-bold text-navy transition-colors group-hover:text-navy-mid">
                  {stateCode}
                </div>
                <div className="mb-3 mt-1 text-xs leading-tight text-muted-foreground">{stateName}</div>
                <div className="text-2xl font-bold text-foreground">{stateCounts[stateCode] ?? 0}</div>
                <div className="text-xs text-muted-foreground">agents</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Insights</p>
              <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Property Insights</h2>
            </div>
            <Link href="/blog" className="hidden text-sm font-medium text-foreground hover:text-navy md:inline-flex">
              View all articles
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-card-hover"
              >
                <div className="h-40 bg-gradient-to-br from-navy to-navy-mid p-5">
                  <span className="rounded-full border border-white/10 bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {post.category ?? "Insights"}
                  </span>
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="font-display text-base font-bold leading-snug text-navy transition-colors group-hover:text-navy-light">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("en-AU") : "Draft"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-20" style={{ backgroundImage: "radial-gradient(circle at 70% 40%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Smart Matching</p>
              <h2 className="font-display text-3xl font-bold leading-tight md:text-4xl">
                Find Your Ideal Agent in 5 Questions
              </h2>
              <p className="text-sm leading-relaxed text-white/60">
                Our matching flow considers your goals, state, timeline and buying support needs, then surfaces relevant verified agents.
              </p>
              <Link
                href="/match-quiz"
                className="inline-flex items-center rounded-md border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Open full quiz experience <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xl">
              <ConversationalQuiz />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground md:gap-10">
            <div className="flex items-center gap-2 border-r border-border/50 pr-6">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span>Verified Directory Model</span>
            </div>
            <div className="flex items-center gap-2 border-r border-border/50 pr-6">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span>BuyerHQ Brokered Introductions</span>
            </div>
            <div className="flex items-center gap-2 border-r border-border/50 pr-6">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span>Negotiated Fee Outcomes</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-muted-foreground/50" />
              <span>Privacy Protected</span>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
