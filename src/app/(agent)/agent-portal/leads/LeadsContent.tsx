"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Select } from "@/components/ui/Select";
import type { EnquiryRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

export default function LeadsContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/agent-portal/login";
        return;
      }

      const { data: profile } = await supabase
        .from("agent_profiles")
        .select("agent_id")
        .eq("id", user.id)
        .single();

      if (!profile?.agent_id) {
        if (!cancelled) {
          setError("No linked agent profile found.");
          setLoading(false);
        }
        return;
      }

      const { data, error: loadError } = await supabase
        .from("enquiries")
        .select("*")
        .eq("agent_id", profile.agent_id)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (loadError) {
          setError(loadError.message);
          setEnquiries([]);
        } else {
          setEnquiries(data ?? []);
        }
        setLoading(false);
      }
    };

    fetchLeads();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const filtered = enquiries.filter((enquiry) =>
    statusFilter === "all" ? true : enquiry.status === statusFilter
  );

  const setStatus = async (id: string, status: EnquiryRow["status"]) => {
    await supabase.from("enquiries").update({ status }).eq("id", id);
    setEnquiries((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const toggleExpanded = async (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
    const current = enquiries.find((item) => item.id === id);
    if (current && !current.is_read) {
      await supabase.from("enquiries").update({ is_read: true }).eq("id", id);
      setEnquiries((items) => items.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    }
  };

  if (loading) return <div className="text-body text-text-secondary">Loading leads...</div>;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Leads & enquiries</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Filter by status, expand details, and update lead progression.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          label="Filter by status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "new", label: "New" },
            { value: "viewed", label: "Viewed" },
            { value: "responded", label: "Responded" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No leads for this filter" description="Try selecting another status." />
      ) : (
        <div className="space-y-2">
          {filtered.map((enquiry) => (
            <Card key={enquiry.id} className="p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-body-sm text-text-primary">
                    {enquiry.buyer_name} · {new Date(enquiry.created_at).toLocaleDateString("en-AU")}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {enquiry.buyer_email} · {enquiry.buyer_phone || "Phone not provided"}
                  </p>
                  <p className="text-caption text-text-secondary">
                    {enquiry.property_type || "Property type not provided"} ·{" "}
                    {enquiry.target_suburbs?.join(", ") || "No target suburbs"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    options={[
                      { value: "new", label: "new" },
                      { value: "viewed", label: "viewed" },
                      { value: "responded", label: "responded" },
                      { value: "closed", label: "closed" },
                    ]}
                    value={enquiry.status ?? "new"}
                    onChange={(event) =>
                      setStatus(
                        enquiry.id,
                        event.target.value as "new" | "viewed" | "responded" | "closed"
                      )
                    }
                  />
                  <Button variant="secondary" onClick={() => toggleExpanded(enquiry.id)}>
                    {expandedId === enquiry.id ? "Hide Details" : "View Details"}
                  </Button>
                </div>
              </div>

              {expandedId === enquiry.id ? (
                <div className="mt-3 rounded-md border border-border bg-surface-2 p-3 text-body-sm text-text-secondary">
                  <p>
                    <span className="text-text-primary">Budget:</span>{" "}
                    {enquiry.budget_min || enquiry.budget_max
                      ? `${enquiry.budget_min ?? "?"} - ${enquiry.budget_max ?? "?"}`
                      : "Not provided"}
                  </p>
                  <p className="mt-2">
                    <span className="text-text-primary">Message:</span> {enquiry.message || "No message provided"}
                  </p>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
