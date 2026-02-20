"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Shield,
  Star,
} from "lucide-react";

import { BuyerHQScore } from "@/components/BuyerHQScore";
import type { AgentRow, ExternalReviewRow, ReviewRow } from "@/lib/database.types";
import { toPublicAgentView } from "@/lib/public-agent";

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted font-display text-2xl font-bold text-foreground">
      {initials}
    </div>
  );
}

export default function AgentProfileContent({
  agent,
  reviews,
  externalReviews,
}: {
  agent: AgentRow;
  reviews: ReviewRow[];
  externalReviews: ExternalReviewRow[];
}) {
  const mapped = useMemo(() => toPublicAgentView(agent), [agent]);
  const [showAllSuburbs, setShowAllSuburbs] = useState(false);
  const suburbsToShow = showAllSuburbs ? mapped.suburbsCovered : mapped.suburbsCovered.slice(0, 8);

  return (
    <div className="bg-background">
      <div className="bg-navy px-4 py-12" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}>
        <div className="container mx-auto">
          <Link href="/find-agents" className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <InitialsAvatar name={mapped.name} />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-white md:text-4xl">{mapped.name}</h1>
                {mapped.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                ) : null}
                {mapped.featured ? <span className="rounded-full bg-foreground px-2.5 py-1 text-xs font-bold text-background">Featured</span> : null}
              </div>
              <p className="text-lg text-white/60">{mapped.company}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/65">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-white/50 text-white/50" />
                  <strong className="text-white">{mapped.rating.toFixed(1)}</strong> ({mapped.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {mapped.suburb}, {mapped.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> Responds in {mapped.responseTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" /> {mapped.feeStructure}
                </span>
              </div>
            </div>
            <Link
              href={`/enquire/${mapped.id}`}
              className="inline-flex items-center rounded-md bg-white px-4 py-2.5 font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Enquire Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
                <div className="font-display text-xl font-bold text-navy">{mapped.yearsExperience}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Years Experience</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
                <div className="font-display text-xl font-bold text-navy">{mapped.dealsCompleted || "—"}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Deals Completed</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
                <div className="font-display text-xl font-bold text-navy">{mapped.reviewCount}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Verified Reviews</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
                <div className="font-display text-xl font-bold text-navy">{mapped.rankScore}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Authority Score</div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-bold text-navy">About {mapped.name}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{mapped.bio}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-bold text-navy">Specialisations</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {mapped.specialisations.map((spec) => (
                  <div key={spec} className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 font-display text-lg font-bold text-navy">Suburbs Covered</h2>
              <div className="flex flex-wrap gap-2">
                {suburbsToShow.map((suburb) => (
                  <Link
                    key={suburb}
                    href={`/suburb/${suburb.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-navy hover:text-navy"
                  >
                    <MapPin className="h-3 w-3" />
                    {suburb}
                  </Link>
                ))}
              </div>
              {mapped.suburbsCovered.length > 8 ? (
                <button
                  onClick={() => setShowAllSuburbs((prev) => !prev)}
                  className="mt-3 text-xs text-muted-foreground transition-colors hover:text-navy"
                >
                  {showAllSuburbs ? "Show fewer suburbs" : `+${mapped.suburbsCovered.length - 8} more suburbs`}
                </button>
              ) : null}
            </div>

            {reviews.length > 0 ? (
              <div>
                <h2 className="mb-4 font-display text-lg font-bold text-navy">Client Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-card p-6 shadow-card">
                      <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: Math.max(1, Math.min(5, review.rating)) }, (_, index) => (
                          <Star key={`${review.id}-${index}`} className="h-4 w-4 fill-foreground text-foreground" />
                        ))}
                      </div>
                      <blockquote className="mb-4 text-sm italic leading-relaxed text-foreground">
                        &quot;{review.comment ?? "Verified review on BuyerHQ."}&quot;
                      </blockquote>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-navy">{review.buyer_name ?? "Verified buyer"}</p>
                          <p className="text-xs text-muted-foreground">{review.property_type ?? "Property purchase"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {externalReviews.length > 0 ? (
              <div>
                <h2 className="mb-4 font-display text-lg font-bold text-navy">External Review Signals</h2>
                <div className="space-y-3">
                  {externalReviews.slice(0, 8).map((review) => (
                    <div key={review.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{review.source}</p>
                        <p className="text-xs text-muted-foreground">{review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString("en-AU") : "Recent"}</p>
                      </div>
                      <div className="mb-2 flex items-center gap-1">
                        {Array.from({ length: Math.max(1, Math.min(5, Math.round(review.rating))) }, (_, index) => (
                          <Star key={`${review.id}-ext-${index}`} className="h-3.5 w-3.5 fill-foreground text-foreground" />
                        ))}
                        <span className="text-xs text-muted-foreground">{review.reviewer_name ?? "Verified reviewer"}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.review_text ?? "External review captured by BuyerHQ sync."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <BuyerHQScore agent={agent} size="lg" />
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 font-display text-base font-bold text-navy">Enquire About This Agent</h3>
                <div className="mb-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Minimum fee</span>
                    <span className="font-semibold text-foreground">
                      {mapped.minFee > 0 ? `$${mapped.minFee.toLocaleString()}` : "Consultation"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fee structure</span>
                    <span className="font-semibold text-foreground">{mapped.feeStructure}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response time</span>
                    <span className="font-semibold text-foreground">{mapped.responseTime}</span>
                  </div>
                </div>
                <Link
                  href={`/enquire/${mapped.id}`}
                  className="inline-flex w-full items-center justify-center rounded-md bg-navy px-4 py-2.5 font-semibold text-white transition-colors hover:bg-navy-mid"
                >
                  Send Enquiry <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Your details are only shared with this agent.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <div>
                    <p className="mb-1 text-xs font-semibold text-foreground">BuyerHQ Verified</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      This profile is validated through BuyerHQ&apos;s verification and moderation workflow.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="mb-1 text-xs font-semibold text-foreground">Track Your Journey</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Use our buyer journey tracker to monitor your progress from shortlist to settlement.
                </p>
                <Link href="/journey" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-navy">
                  Open Journey Tracker <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
