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
import { buildTrustScoreSummary } from "@/lib/review-trust";

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
  const areaSpecialist = suburbs[0] ?? "Australia-wide";
  const additionalAreas = Math.max(suburbs.length - 1, 0);
  const aboutHeading = useMemo(() => {
    const stateLabel = agent.state ? ` for ${agent.state}` : "";
    return `Meet ${agent.name} — Your Expert Buyer’s Agent${stateLabel}`;
  }, [agent.name, agent.state]);
  const trustSummary = useMemo(
    () =>
      buildTrustScoreSummary({
        externalReviews,
        internalReviews: reviews,
      }),
    [externalReviews, reviews]
  );
  const featuredExternal = useMemo(() => externalReviews.slice(0, 12), [externalReviews]);

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <nav className="font-mono text-caption text-text-secondary">
        <Link href="/" className="hover:text-text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/agents" className="hover:text-text-primary">
          Find Agents
        </Link>{" "}
        / <span className="text-text-primary">{agent.name}</span>
      </nav>

      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <Avatar name={agent.name} src={agent.avatar_url} size="lg" />
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-display text-text-primary">{agent.name}</h1>
                <p className="text-body text-text-secondary">{agent.agency_name ?? "Independent Advisor"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
                {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
              </div>
            </div>
            <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="state">Trust score: {trustSummary.score}/100</Badge>
              {trustSummary.sourceBadges.slice(0, 4).map((badge) => (
                <Badge key={badge.source} variant="specialization" className="normal-case">
                  {badge.label}: {badge.count}
                </Badge>
              ))}
            </div>
            <h2 className="text-heading text-text-primary">{aboutHeading}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="state">Area specialist: {areaSpecialist}</Badge>
              {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
              {additionalAreas > 0 ? <Badge variant="state">+{additionalAreas} areas</Badge> : null}
            </div>
            <p className="text-body text-text-secondary">
              BuyerHQ uses brokered introductions only. Enquiries are coordinated via our team before agent handover.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Rating</p>
          <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Reviews</p>
          <p className="text-heading text-text-primary">
            {(agent.review_count ?? 0) + trustSummary.approvedExternalCount}
          </p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Experience</p>
          <p className="text-heading text-text-primary">{agent.years_experience ?? 0} years</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Properties Purchased</p>
          <p className="text-heading text-text-primary">{agent.properties_purchased ?? 0}</p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-heading">About</h2>
            <p className="mt-2 text-body text-text-secondary">{agent.bio ?? "Profile bio pending."}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Specializations</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(agent.specializations ?? []).map((item) => (
                <Badge key={item} variant="specialization">
                  {item}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Target Suburbs</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(agent.suburbs ?? []).length === 0 ? (
                <Badge variant="state">Australia-wide coverage</Badge>
              ) : (
                (agent.suburbs ?? []).map((suburb) => (
                  <Badge key={suburb} variant="state">
                    {suburb}
                  </Badge>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Reviews</h2>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <p className="text-body-sm text-text-secondary">No approved reviews yet.</p>
              ) : null}
              {reviews.map((review) => (
                <div key={review.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-body-sm text-text-primary">{review.buyer_name ?? "Verified Buyer"}</p>
                    <Rating value={review.rating} />
                  </div>
                  <p className="text-body-sm text-text-secondary">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Verified web reviews</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Aggregated from mapped external sources, moderated by BuyerHQ.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trustSummary.sourceBadges.length === 0 ? (
                <p className="text-caption text-text-muted">No approved external reviews yet.</p>
              ) : (
                trustSummary.sourceBadges.map((badge) => (
                  <Badge key={`${badge.source}-badge`} variant="state" className="normal-case">
                    {badge.label} · {badge.count} · {badge.avgRating.toFixed(1)}
                  </Badge>
                ))
              )}
            </div>
            <div className="mt-4 space-y-2">
              {featuredExternal.length === 0 ? (
                <p className="text-body-sm text-text-secondary">
                  External sources have not been connected for this profile yet.
                </p>
              ) : (
                featuredExternal.map((review) => (
                  <div key={review.id} className="rounded-md border border-border p-3">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-body-sm text-text-primary">
                        {review.reviewer_name || "Verified reviewer"} · {review.source}
                      </p>
                      <p className="text-caption text-text-secondary">{review.rating.toFixed(1)}/5</p>
                    </div>
                    <p className="text-body-sm text-text-secondary">{review.review_text || "No text provided."}</p>
                    {review.review_url ? (
                      <a
                        href={review.review_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-caption text-text-primary underline"
                      >
                        View source
                      </a>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-heading">Enquiry via BuyerHQ</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            For privacy and quality control, BuyerHQ brokers all introductions. Complete the quiz and we&apos;ll handle
            outreach to this agent on your behalf.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href="/signup">Buyer Sign Up</Link>
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/login">Buyer Login</Link>
            </Button>
          </div>
          <div className="mt-4 rounded-md border border-border bg-surface-2 p-3">
            <p className="font-mono text-label uppercase text-text-secondary">Fee Structure</p>
            <p className="mt-1 text-body-sm text-text-primary">
              {agent.fee_structure ?? "Fee details shared during brokered introduction."}
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            <Button asChild>
              <Link href={`/quiz?agent=${encodeURIComponent(agent.id)}`}>
                Take Match Quiz
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
