"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Heart, MapPin, Star } from "lucide-react";

import type { AgentRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AgentCard({
  agent,
  compact = false,
  showEnquiryAction = true,
}: {
  agent: AgentRow;
  compact?: boolean;
  showEnquiryAction?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const suburbs = useMemo(() => agent.suburbs ?? [], [agent.suburbs]);
  const primarySuburb = useMemo(() => suburbs[0] ?? "Australia-wide", [suburbs]);
  const suburbsLabel = useMemo(() => {
    const suburbs = agent.suburbs ?? [];
    if (suburbs.length === 0) return "Australia-wide coverage";
    if (suburbs.length <= 4) return suburbs.join(", ");
    return `${suburbs.slice(0, 4).join(", ")} +${suburbs.length - 4} more`;
  }, [agent.suburbs]);
  const bioPreview = useMemo(() => {
    const cleaned = (agent.bio ?? "").trim();
    if (!cleaned) {
      return "Specialist buyer representation with a strategy-first approach across local and off-market opportunities.";
    }
    if (cleaned.length <= 240) return cleaned;
    return `${cleaned.slice(0, 237)}...`;
  }, [agent.bio]);
  const specializationPreview = useMemo(
    () => (agent.specializations ?? []).slice(0, compact ? 4 : 7),
    [agent.specializations, compact]
  );
  const coverageCount = Math.max(suburbs.length - 1, 0);

  return (
    <Card interactive className={cn("h-full p-4", compact ? "p-3" : "p-4")}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={agent.name} src={agent.avatar_url} size={compact ? "md" : "lg"} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-subheading text-text-primary">{agent.name}</h3>
                <p className="text-body-sm text-text-secondary">{agent.agency_name ?? "Independent Advisor"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
                <Badge variant="state" className="normal-case">
                  BUYERHQRANK {agent.buyerhqrank ?? "STARTER"}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 text-body-sm text-text-primary">
                <Star size={14} className="fill-current text-amber-500" />
                {typeof agent.avg_rating === "number" ? agent.avg_rating.toFixed(1) : "N/A"}
              </div>
              <span className="text-body-sm text-text-secondary">
                ({agent.review_count ?? 0} review{agent.review_count === 1 ? "" : "s"})
              </span>
              <span className="text-body-sm text-text-secondary">Authority {agent.authority_score ?? 0}/100</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="state" className="normal-case">
                Social: {agent.social_media_presence ?? "D"}
              </Badge>
              <Badge variant="state" className="normal-case">
                Followers: {(agent.total_followers ?? 0).toLocaleString("en-AU")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-body-sm text-text-secondary">{bioPreview}</p>
          <div className="flex flex-wrap gap-2">
            {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
            <Badge variant="state" className="normal-case">
              <MapPin size={12} />
              Area specialist: {primarySuburb}
              {agent.state ? `, ${agent.state}` : ""}
            </Badge>
            {coverageCount > 0 ? <Badge variant="state">+{coverageCount} areas</Badge> : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-caption text-text-secondary lg:grid-cols-4">
          <div className="rounded-md border border-border bg-surface-2 px-2 py-2">
            <p className="font-mono text-label uppercase">Experience</p>
            <p className="text-body-sm text-text-primary">{agent.years_experience ?? 0} yrs</p>
          </div>
          <div className="rounded-md border border-border bg-surface-2 px-2 py-2">
            <p className="font-mono text-label uppercase">Properties</p>
            <p className="text-body-sm text-text-primary">{agent.properties_purchased ?? 0} settled</p>
          </div>
          <div className="rounded-md border border-border bg-surface-2 px-2 py-2">
            <p className="font-mono text-label uppercase">Reviews</p>
            <p className="text-body-sm text-text-primary">{agent.review_count ?? 0} verified</p>
          </div>
          <div className="rounded-md border border-border bg-surface-2 px-2 py-2">
            <p className="font-mono text-label uppercase">Coverage</p>
            <p className="text-body-sm text-text-primary">{suburbsLabel}</p>
          </div>
        </div>

        {specializationPreview.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specializationPreview.map((specialization) => (
              <Badge key={specialization} variant="specialization" className="normal-case">
                {specialization}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
          <p className="font-mono text-label uppercase text-text-secondary">Fee Structure</p>
          <p className="text-body-sm text-text-primary">{agent.fee_structure ?? "Fee details shared on request."}</p>
          <p className="mt-2 text-caption text-text-muted">
            BuyerHQ brokered introductions only. We coordinate with agents before any next-step handover.
          </p>
        </div>

        <div className={cn("mt-auto grid gap-2", showEnquiryAction ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          <Button variant="primary" asChild>
            <Link href={`/agents/${agent.id}`}>
              View Profile
              <ArrowRight size={14} />
            </Link>
          </Button>
          {showEnquiryAction ? (
            <Button variant="secondary" asChild>
              <Link href={`/quiz?agent=${encodeURIComponent(agent.id)}`}>Enquire via BuyerHQ</Link>
            </Button>
          ) : null}
          <Button
            variant="secondary"
            loading={saveLoading}
            disabled={saveLoading || isSaved}
            onClick={async () => {
              setSaveLoading(true);
              setSaveError(null);
              setShowAuthPrompt(false);
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (!user) {
                setShowAuthPrompt(true);
                setSaveLoading(false);
                return;
              }
              const { error } = await supabase
                .from("saved_agents")
                .upsert({ buyer_id: user.id, agent_id: agent.id }, { onConflict: "buyer_id,agent_id" });
              if (error) {
                setSaveError(error.message);
              } else {
                setIsSaved(true);
              }
              setSaveLoading(false);
            }}
          >
            <Heart size={14} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
        {showAuthPrompt ? (
          <div className="rounded-md border border-border bg-surface-2 px-3 py-3">
            <p className="text-caption text-text-secondary">
              Create a buyer account or log in to save this profile to your shortlist.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" asChild>
                <Link href="/signup">Create Buyer Account</Link>
              </Button>
              <Button size="sm" variant="secondary" asChild>
                <Link href="/login">Buyer Login</Link>
              </Button>
            </div>
          </div>
        ) : null}
        {saveError ? <p className="text-caption text-destructive">{saveError}</p> : null}
      </div>
    </Card>
  );
}
