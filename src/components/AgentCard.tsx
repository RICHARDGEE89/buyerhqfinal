"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";

import type { AgentRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const specialistOptions = new Set([
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
]);

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
  const specialist = useMemo(() => {
    const first =
      (agent.specializations ?? []).find((value) => specialistOptions.has(value)) ??
      (agent.specializations ?? [])[0] ??
      "";
    return first || "No verified specialist yet.";
  }, [agent.specializations]);
  const coverage = useMemo(() => {
    if (suburbs.length > 0) {
      const label = suburbs.slice(0, 2).join(", ");
      return agent.state ? `${label}, ${agent.state}` : label;
    }
    if (agent.state) return `${agent.state} only`;
    return "No verified coverage yet.";
  }, [agent.state, suburbs]);
  const aboutAgency = useMemo(() => {
    const text = (agent.about ?? agent.bio ?? "").trim();
    if (!text) return "No verified agency information yet.";
    if (text.length <= 130) return text;
    return `${text.slice(0, 127)}...`;
  }, [agent.about, agent.bio]);
  const rankLabel = useMemo(() => formatRankLabel(agent.buyerhqrank), [agent.buyerhqrank]);

  return (
    <Card interactive className={cn("h-full p-3", compact ? "p-2.5" : "p-3")}>
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <Avatar name={agent.name} src={agent.avatar_url} size="md" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-body-sm text-text-primary">{agent.agency_name ?? "No verified agency name yet."}</p>
            <p className="truncate text-caption text-text-secondary">{agent.name}</p>
          </div>
          {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
        </div>

        <div className="space-y-2 rounded-md border border-border bg-surface-2 p-2.5">
          <p className="text-caption text-text-secondary">
            <span className="font-medium text-text-primary">Buyer HQ Rank:</span> {rankLabel}
          </p>
          <p className="text-caption text-text-secondary">
            <span className="font-medium text-text-primary">Specialist:</span> {specialist}
          </p>
          <p className="text-caption text-text-secondary">
            <span className="font-medium text-text-primary">Coverage:</span> {coverage}
          </p>
          <p className="text-caption text-text-secondary">
            <span className="font-medium text-text-primary">About Agency:</span> {aboutAgency}
          </p>
        </div>

        <div className={cn("mt-auto grid gap-2", showEnquiryAction ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
          <Button variant="primary" size="sm" asChild>
            <Link href={`/agents/${agent.id}`}>View</Link>
          </Button>
          {showEnquiryAction ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/quiz?agent=${encodeURIComponent(agent.id)}`}>Enquire</Link>
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
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

function formatRankLabel(value: string | null) {
  const base = (value || "STARTER").toLowerCase();
  if (!base.trim()) return "Starter";
  return base
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
