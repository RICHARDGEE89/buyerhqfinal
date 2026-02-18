"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import type { AgentRow, EnquiryRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type EnquiryWithAgent = EnquiryRow & {
  agent: Pick<AgentRow, "id" | "name" | "agency_name" | "state" | "is_verified"> | null;
};

type StatusFilter = "all" | "new" | "viewed" | "responded" | "closed";

export default function MyEnquiriesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryWithAgent[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [followUpTarget, setFollowUpTarget] = useState<EnquiryWithAgent | null>(null);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [sendingFollowUp, setSendingFollowUp] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      window.location.href = "/login";
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("enquiries")
      .select("*, agent:agents(id, name, agency_name, state, is_verified)")
      .eq("buyer_email", user.email)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setEnquiries([]);
      setLoading(false);
      return;
    }

    setEnquiries((data ?? []) as EnquiryWithAgent[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadEnquiries();
  }, [loadEnquiries]);

  const filtered = enquiries.filter((item) => (statusFilter === "all" ? true : item.status === statusFilter));

  const closeEnquiry = async (enquiry: EnquiryWithAgent) => {
    const { error: updateError } = await supabase
      .from("enquiries")
      .update({ status: "closed" })
      .eq("id", enquiry.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setEnquiries((current) => current.map((item) => (item.id === enquiry.id ? { ...item, status: "closed" } : item)));
    setResult("Enquiry marked as closed.");
  };

  const openFollowUp = (enquiry: EnquiryWithAgent) => {
    setFollowUpTarget(enquiry);
    setFollowUpMessage(
      enquiry.message
        ? `Following up on my previous request:\n\n"${enquiry.message}"\n\nCould you please share next steps?`
        : "Following up on my enquiry. Could you please share next steps?"
    );
    setModalOpen(true);
  };

  const sendFollowUp = async () => {
    if (!followUpTarget) return;
    if (!followUpMessage.trim()) {
      setResult("Please enter a follow-up message.");
      return;
    }

    setSendingFollowUp(true);
    setResult(null);

    const payload = {
      agent_id: followUpTarget.agent_id,
      buyer_name: followUpTarget.buyer_name,
      buyer_email: followUpTarget.buyer_email,
      buyer_phone: followUpTarget.buyer_phone ?? undefined,
      message: followUpMessage.trim(),
      budget_min: followUpTarget.budget_min ?? undefined,
      budget_max: followUpTarget.budget_max ?? undefined,
      target_suburbs: followUpTarget.target_suburbs ?? undefined,
      property_type: followUpTarget.property_type ?? undefined,
    };

    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setResult(data.error ?? "Unable to send follow-up.");
      setSendingFollowUp(false);
      return;
    }

    setModalOpen(false);
    setSendingFollowUp(false);
    setResult("Follow-up enquiry sent successfully.");
    void loadEnquiries();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && enquiries.length === 0) {
    return <ErrorState description={error} onRetry={loadEnquiries} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">My enquiries</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Track enquiry progress, send follow-ups, and close completed threads.
        </p>
      </section>

      <section className="flex flex-wrap items-end justify-between gap-3">
        <Select
          label="Status filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "viewed", label: "Viewed" },
            { value: "responded", label: "Responded" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <Button variant="secondary" asChild>
          <Link href="/agents">View matching agents</Link>
        </Button>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="No enquiries found"
          description="Try another filter or start a new enquiry from the agent directory."
          actionLabel="Browse agents"
          onAction={() => (window.location.href = "/agents")}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((enquiry) => (
            <Card key={enquiry.id} className="p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-subheading">
                      {enquiry.agent?.agency_name || enquiry.agent?.name || "Agent"}
                    </h2>
                    <span className="rounded-full border border-border-light bg-surface-2 px-2 py-1 font-mono text-caption uppercase text-text-secondary">
                      {enquiry.status ?? "new"}
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm text-text-secondary">
                    {enquiry.property_type || "Property type not specified"} ·{" "}
                    {enquiry.target_suburbs?.join(", ") || "No target suburbs"}
                  </p>
                  <p className="text-caption text-text-muted">
                    Sent {new Date(enquiry.created_at).toLocaleDateString("en-AU")} ·{" "}
                    {enquiry.agent?.state || "State unknown"}
                  </p>
                  {enquiry.message ? (
                    <p className="mt-2 rounded-md border border-border bg-surface-2 p-2 text-caption text-text-secondary">
                      {enquiry.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" onClick={() => openFollowUp(enquiry)}>
                    Follow up
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => closeEnquiry(enquiry)}
                    disabled={enquiry.status === "closed"}
                  >
                    Close enquiry
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-body-sm text-text-secondary">
          {result}
        </p>
      ) : null}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Follow up with ${followUpTarget?.agent?.agency_name || followUpTarget?.agent?.name || "agent"}`}
      >
        <div className="space-y-3">
          <Textarea
            label="Message"
            value={followUpMessage}
            onChange={(event) => setFollowUpMessage(event.target.value)}
          />
          <Button loading={sendingFollowUp} disabled={sendingFollowUp} fullWidth onClick={sendFollowUp}>
            Send follow-up
          </Button>
        </div>
      </Modal>
    </div>
  );
}
