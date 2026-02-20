"use client";

import Link from "next/link";
import { Clock, DollarSign, MapPin, Plus, Shield, Star, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PublicAgentView } from "@/lib/public-agent";

type DirectAgentCardProps = {
  agent: PublicAgentView;
  view?: "grid" | "list";
  compareIds?: string[];
  onCompareToggle?: (id: string) => void;
  blindMode?: boolean;
};

function scoreLabel(rankScore: number) {
  if (rankScore >= 90) return "Elite";
  if (rankScore >= 75) return "Premier";
  if (rankScore >= 60) return "Advanced";
  return "Established";
}

export function DirectAgentCard({
  agent,
  view = "grid",
  compareIds = [],
  onCompareToggle,
  blindMode = false,
}: DirectAgentCardProps) {
  const isList = view === "list";
  const isComparing = compareIds.includes(agent.id);
  const compareDisabled = !isComparing && compareIds.length >= 3;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover",
        isList ? "flex flex-col sm:flex-row" : "flex flex-col",
        isComparing && "ring-2 ring-foreground"
      )}
    >
      <div className={cn("relative bg-gradient-to-br from-muted to-muted/50", isList ? "sm:w-48" : "h-36 w-full")}>
        {blindMode ? (
          <div className={cn("flex items-center justify-center bg-muted/60", isList ? "h-full" : "h-36")}>
            <div className="select-none font-display text-4xl font-bold text-muted-foreground/30">?</div>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
        )}

        {!blindMode && agent.verified ? (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-navy px-2 py-1 text-xs font-semibold text-white">
            <Shield className="h-3 w-3 text-white/60" />
            Verified
          </div>
        ) : null}

        {!blindMode && onCompareToggle ? (
          <button
            onClick={() => onCompareToggle(agent.id)}
            disabled={compareDisabled}
            className={cn(
              "absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-all",
              isComparing
                ? "border-foreground bg-foreground text-background"
                : compareDisabled
                  ? "cursor-not-allowed border-border/50 bg-muted/70 text-muted-foreground/50"
                  : "border-border bg-white/90 text-foreground hover:border-foreground"
            )}
            title={isComparing ? "Remove from comparison" : compareDisabled ? "Max 3 agents" : "Add to compare"}
          >
            {isComparing ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-semibold text-foreground group-hover:text-navy">
                {blindMode ? "Agent Hidden" : agent.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">{blindMode ? "Company hidden" : agent.company}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="text-sm font-semibold text-foreground">{agent.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({agent.reviewCount})</span>
              </div>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                BuyerHQ {scoreLabel(agent.rankScore)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {agent.suburb}, {agent.state}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {agent.yearsExperience} yrs exp
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {agent.feeStructure}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {agent.specialisations.slice(0, 3).map((spec) => (
            <span key={spec} className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {spec}
            </span>
          ))}
        </div>

        {isList ? <p className="line-clamp-2 text-sm text-muted-foreground">{agent.bio}</p> : null}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <div className="text-sm">
            <span className="text-muted-foreground">From </span>
            <span className="font-semibold text-foreground">
              {agent.minFee > 0 ? `$${agent.minFee.toLocaleString()}` : "Fee on consultation"}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/agents/${agent.slug || agent.id}`}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-navy hover:bg-navy hover:text-white"
            >
              View Profile
            </Link>
            <Link
              href={`/enquire/${agent.id}`}
              className="rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy-mid"
            >
              Enquire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
