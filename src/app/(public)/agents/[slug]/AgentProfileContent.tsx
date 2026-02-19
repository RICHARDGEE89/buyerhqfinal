"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight } from "lucide-react";

import type { AgentRow, ExternalReviewRow, ReviewRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Rating } from "@/components/ui/Rating";

const specialistOptions = new Set([
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
]);

export default function AgentProfileContent({
  agent,
  reviews,
  externalReviews,
}: {
  agent: AgentRow;
  reviews: ReviewRow[];
  externalReviews: ExternalReviewRow[];
}) {
  const suburbs = useMemo(() => agent.suburbs ?? [], [agent.suburbs]);
  const specialist = useMemo(() => {
    const item =
      (agent.specializations ?? []).find((value) => specialistOptions.has(value)) ??
      (agent.specializations ?? [])[0] ??
      "";
    return item || "No verified specialist yet.";
  }, [agent.specializations]);
  const coverage = useMemo(() => {
    if (suburbs.length > 0) {
      const joined = suburbs.slice(0, 4).join(", ");
      return agent.state ? `${joined}, ${agent.state}` : joined;
    }
    if (agent.state) return `${agent.state} only`;
    return "No verified coverage yet.";
  }, [agent.state, suburbs]);
  const aboutAgency = useMemo(() => {
    const text = (agent.about ?? "").trim();
    return text || "No verified agency information yet.";
  }, [agent.about]);
  const agentBio = useMemo(() => {
    const text = (agent.bio ?? "").trim();
    return text || "No verified agent bio yet.";
  }, [agent.bio]);
  const rankLabel = useMemo(() => formatRankLabel(agent.buyerhqrank), [agent.buyerhqrank]);
  const verifiedReviewCount = (reviews?.length ?? 0) + (externalReviews?.length ?? 0);

  return (
    <div className="container space-y-5 pb-14 pt-8">
      <nav className="font-mono text-caption text-text-secondary">
        <Link href="/" className="hover:text-text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/agents" className="hover:text-text-primary">
          Find Agents
        </Link>{" "}
        / <span className="text-text-primary">{agent.agency_name ?? agent.name}</span>
      </nav>

      <section className="rounded-xl border border-border bg-surface p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <Avatar name={agent.name} src={agent.avatar_url} size="lg" />
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-heading text-text-primary">{agent.agency_name ?? "No verified agency name yet."}</h1>
                <p className="text-body-sm text-text-secondary">{agent.name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
                {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
                <Badge variant="state" className="normal-case">
                  Buyer HQ Rank: {rankLabel}
                </Badge>
              </div>
            </div>
            <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />
            <div className="flex flex-wrap gap-2">
              <Badge variant="state">Specialist: {specialist}</Badge>
              <Badge variant="state">Coverage: {coverage}</Badge>
            </div>
            <p className="text-body-sm text-text-secondary">{aboutAgency}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Google Rating</p>
          <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Google Reviews</p>
          <p className="text-heading text-text-primary">{(agent.google_reviews ?? 0).toLocaleString("en-AU")}</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Experience</p>
          <p className="text-heading text-text-primary">{agent.years_experience ?? 0} years</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Properties</p>
          <p className="text-heading text-text-primary">{agent.properties_purchased ?? 0}</p>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Social Media Score</p>
          <p className="text-heading text-text-primary">{agent.social_media_presence ?? "D"}</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Total Followers</p>
          <p className="text-heading text-text-primary">{(agent.total_followers ?? 0).toLocaleString("en-AU")}</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Verified Reviews</p>
          <p className="text-body-sm text-text-secondary">
            {verifiedReviewCount > 0
              ? `${verifiedReviewCount} verified review${verifiedReviewCount === 1 ? "" : "s"}`
              : "No verified reviews yet."}
          </p>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">External signals</p>
          <p className="text-body-sm text-text-secondary">
            Facebook {formatRating(agent.facebook_rating)} ({agent.facebook_reviews ?? 0})
          </p>
          <p className="text-body-sm text-text-secondary">
            Instagram {(agent.instagram_followers ?? 0).toLocaleString("en-AU")} · TikTok{" "}
            {(agent.tiktok_followers ?? 0).toLocaleString("en-AU")}
          </p>
          <p className="text-body-sm text-text-secondary">
            YouTube {(agent.youtube_subscribers ?? 0).toLocaleString("en-AU")} · LinkedIn{" "}
            {(agent.linkedin_followers ?? 0).toLocaleString("en-AU")}
          </p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Fee Structure</p>
          <p className="text-body-sm text-text-primary">{agent.fee_structure ?? "No verified fee structure yet."}</p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-heading">About Agency</h2>
            <p className="mt-2 text-body-sm text-text-secondary">{aboutAgency}</p>
          </Card>
          <Card className="p-5">
            <h2 className="text-heading">Agent Bio</h2>
            <p className="mt-2 text-body-sm text-text-secondary">{agentBio}</p>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-heading">Enquiry via BuyerHQ</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Complete the quiz and BuyerHQ will coordinate the introduction on your behalf.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/signup">Buyer Sign Up</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/login">Buyer Login</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-2">
            <Button asChild>
              <Link href={`/quiz?agent=${encodeURIComponent(agent.id)}`}>
                Enquire
                <ArrowRight size={14} />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/agents">Back to directory</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function formatRating(value: number | null) {
  return typeof value === "number" ? value.toFixed(1) : "No verified rating yet.";
}

function formatRankLabel(value: string | null) {
  const base = (value || "STARTER").toLowerCase();
  if (!base.trim()) return "Starter";
  return base
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
