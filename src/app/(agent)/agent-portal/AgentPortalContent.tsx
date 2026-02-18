"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { resolveAgentProfileForUser } from "@/lib/agent-profile";
import type { AgentRow, EnquiryRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

export default function AgentPortalContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentRow | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/agent-portal/login";
        return;
      }

      const { agentId, error: profileError } = await resolveAgentProfileForUser(supabase, user);
      if (profileError) {
        if (!cancelled) {
          setLoading(false);
          setError(profileError);
        }
        return;
      }

      if (!agentId) {
        if (!cancelled) {
          setLoading(false);
          setError("No linked agent profile found for this account.");
        }
        return;
      }

      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agentId)
        .single();

      if (agentError || !agentData) {
        if (!cancelled) {
          setError(agentError?.message ?? "Unable to load agent profile.");
          setLoading(false);
        }
        return;
      }

      const { data: enquiryData, error: enquiryError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!cancelled) {
        setAgent(agentData);
        setEnquiries(enquiryError ? [] : enquiryData ?? []);
        setError(enquiryError ? enquiryError.message : null);
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const thisWeekCount = enquiries.filter(
    (enquiry) => new Date(enquiry.created_at).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  const completionFields = [
    agent?.agency_name,
    agent?.bio,
    agent?.phone,
    agent?.website_url,
    agent?.linkedin_url,
    agent?.fee_structure,
    agent?.specializations?.length ? "ok" : "",
    agent?.suburbs?.length ? "ok" : "",
    agent?.state,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const updateEnquiry = async (enquiryId: string, status: EnquiryRow["status"], markRead = false) => {
    await supabase
      .from("enquiries")
      .update({
        status,
        is_read: markRead ? true : undefined,
      })
      .eq("id", enquiryId);
    setEnquiries((current) =>
      current.map((item) =>
        item.id === enquiryId
          ? { ...item, status, is_read: markRead ? true : item.is_read }
          : item
      )
    );
  };

  if (loading) {
    return <div className="text-body text-text-secondary">Loading dashboard...</div>;
  }

  if (error && !agent) {
    return <ErrorState description={error} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Hello, {agent?.name ?? "Agent"}</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Welcome back to your BuyerHQ portal.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New leads this week" value={thisWeekCount} />
        <StatCard label="Total enquiries" value={enquiries.length} />
        <StatCard label="Profile views" value={Math.max(85, enquiries.length * 17)} hint="Mock views count" />
        <StatCard label="Average rating" value={agent?.avg_rating?.toFixed(1) ?? "N/A"} />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Card className="space-y-3 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-subheading">Recent enquiries</h2>
            <Button variant="secondary" asChild>
              <Link href="/agent-portal/leads">View all leads</Link>
            </Button>
          </div>

          {enquiries.length === 0 ? (
            <EmptyState title="No enquiries yet" description="New leads will appear here once buyers enquire." />
          ) : (
            <div className="space-y-2">
              {enquiries.slice(0, 5).map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-body-sm text-text-primary">
                      {maskName(enquiry.buyer_name)} · {new Date(enquiry.created_at).toLocaleDateString("en-AU")}
                    </p>
                    <p className="text-caption text-text-secondary">
                      Status: {enquiry.status} {enquiry.is_read ? "(read)" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => updateEnquiry(enquiry.id, enquiry.status ?? "viewed", true)}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => updateEnquiry(enquiry.id, "responded", true)}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Profile completion</h2>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full bg-accent transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="text-caption text-text-secondary">{completionPct}% complete</p>

          <div className="grid gap-2 pt-2">
            <Button variant="secondary" asChild>
              <Link href={`/agents/${agent?.id ?? ""}`}>View Public Profile</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/agent-portal/profile">Edit Profile</Link>
            </Button>
            <Button asChild>
              <Link href="/agent-portal/billing">Upgrade Plan</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}

function maskName(name: string) {
  if (!name) return "Buyer";
  const [first, last] = name.split(" ");
  if (!last) return `${first[0]}***`;
  return `${first} ${last[0]}***`;
}
