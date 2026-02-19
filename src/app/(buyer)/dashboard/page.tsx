"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import type { AgentRow, EnquiryRow, StateCode } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function BuyerDashboardOverview() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buyerName, setBuyerName] = useState("Buyer");
  const [preferredState, setPreferredState] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [recommendedAgents, setRecommendedAgents] = useState<AgentRow[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/login";
      return;
    }

    const fullName = [toText(user.user_metadata?.first_name), toText(user.user_metadata?.last_name)]
      .filter(Boolean)
      .join(" ");
    setBuyerName(fullName || user.email?.split("@")[0] || "Buyer");
    setPreferredState(toText(user.user_metadata?.preferred_state).toUpperCase());

    const [savedRes, enquiriesRes] = await Promise.all([
      supabase.from("saved_agents").select("id", { count: "exact", head: true }).eq("buyer_id", user.id),
      supabase.from("enquiries").select("*").eq("buyer_email", user.email ?? "").order("created_at", { ascending: false }),
    ]);

    if (savedRes.error || enquiriesRes.error) {
      setError(savedRes.error?.message || enquiriesRes.error?.message || "Unable to load buyer dashboard.");
      setLoading(false);
      return;
    }

    setSavedCount(savedRes.count ?? 0);
    setEnquiries(enquiriesRes.data ?? []);

    const preferredState = toText(user.user_metadata?.preferred_state).toUpperCase();
    const params = new URLSearchParams({
      verified: "true",
      page: "1",
      limit: "3",
    });
    if (preferredState && stateCodes.includes(preferredState as StateCode)) {
      params.set("state", preferredState);
    }

    const response = await fetch(`/api/agents?${params.toString()}`);
    const payload = (await response.json()) as { agents?: AgentRow[]; error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Unable to load recommendations.");
      setLoading(false);
      return;
    }

    setRecommendedAgents(payload.agents ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeEnquiries = enquiries.filter((item) => item.status !== "closed").length;
  const respondedEnquiries = enquiries.filter((item) => item.status === "responded").length;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-heading">Hi, {buyerName}</h1>
            <p className="mt-2 text-body-sm text-text-secondary">
              {preferredState ? `Tracking opportunities in ${preferredState}.` : "Track your property search activity."}
            </p>
          </div>
          <Button asChild>
            <Link href="/quiz">Update match quiz</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved agents" value={savedCount} />
        <StatCard label="Active enquiries" value={activeEnquiries} />
        <StatCard label="Agent responses" value={respondedEnquiries} />
        <StatCard label="Total enquiries" value={enquiries.length} />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Recommended agents</h2>
          {recommendedAgents.length === 0 ? (
            <EmptyState
              title="No recommendations yet"
              description="Complete your profile and quiz preferences to improve recommendations."
              actionLabel="Complete profile"
              onAction={() => (window.location.href = "/dashboard/profile")}
            />
          ) : (
            <div className="space-y-2">
              {recommendedAgents.map((agent) => (
                <div key={agent.id} className="rounded-md border border-border p-3">
                  <p className="text-body-sm text-text-primary">
                    {agent.name} · {agent.agency_name || "Independent advisor"}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {agent.state || "No state"} · Rating {agent.avg_rating?.toFixed(1) ?? "N/A"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="secondary" asChild>
                      <Link href={`/agents/${agent.id}`}>View profile</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Next steps</h2>
          <div className="space-y-2 text-body-sm text-text-secondary">
            <p>1. Keep your buyer profile updated with budget and target suburbs.</p>
            <p>2. Save at least 3 agents to compare communication and fee structures.</p>
            <p>3. Submit a brokered enquiry from your saved list and let BuyerHQ coordinate outreach.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" asChild>
              <Link href="/dashboard/profile">Edit profile</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/saved">Open saved agents</Link>
            </Button>
            <Button asChild>
              <Link href="/agents">Browse agents</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}
