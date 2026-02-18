"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { fetchAdminPanelData } from "@/lib/admin-api";
import type {
  AgentRow,
  BlogPostRow,
  ContactSubmissionRow,
  EnquiryRow,
  ReviewRow,
} from "@/lib/database.types";

type LogType = "all" | "agent" | "enquiry" | "review" | "contact" | "blog";

type ActivityLog = {
  id: string;
  type: Exclude<LogType, "all">;
  createdAt: string;
  title: string;
  description: string;
  actor: string;
};

export default function AdminLogsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [filter, setFilter] = useState<LogType>("all");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [contacts, setContacts] = useState<ContactSubmissionRow[]>([]);
  const [posts, setPosts] = useState<BlogPostRow[]>([]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPanelData();
      setAgents(payload.agents.slice(0, 60));
      setEnquiries(payload.enquiries.slice(0, 60));
      setReviews(payload.reviews.slice(0, 60));
      setContacts(payload.contacts.slice(0, 60));
      setPosts(payload.posts.slice(0, 60));
      setWarning(payload.warning ?? null);
      setLoading(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load logs.");
      setAgents([]);
      setEnquiries([]);
      setReviews([]);
      setContacts([]);
      setPosts([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const entries = useMemo<ActivityLog[]>(() => {
    const agentLogs: ActivityLog[] = agents.map((agent) => ({
      id: `agent-${agent.id}`,
      type: "agent",
      createdAt: agent.created_at,
      title: `Agent profile ${agent.is_active ? "active" : "inactive"}`,
      description: `${agent.name} (${agent.email}) · ${agent.is_verified ? "Verified" : "Pending verification"}`,
      actor: agent.name,
    }));

    const enquiryLogs: ActivityLog[] = enquiries.map((enquiry) => ({
      id: `enquiry-${enquiry.id}`,
      type: "enquiry",
      createdAt: enquiry.created_at,
      title: `Buyer enquiry ${enquiry.status ?? "new"}`,
      description: `${enquiry.buyer_name} to agent ${enquiry.agent_id}`,
      actor: enquiry.buyer_email,
    }));

    const reviewLogs: ActivityLog[] = reviews.map((review) => ({
      id: `review-${review.id}`,
      type: "review",
      createdAt: review.created_at,
      title: `Review ${review.is_approved ? "approved" : "pending"}`,
      description: `${review.buyer_name ?? "Buyer"} rated ${review.rating}/5`,
      actor: review.buyer_name ?? "Buyer",
    }));

    const contactLogs: ActivityLog[] = contacts.map((contact) => ({
      id: `contact-${contact.id}`,
      type: "contact",
      createdAt: contact.created_at,
      title: `Contact submission ${contact.is_resolved ? "resolved" : "open"}`,
      description: contact.subject || "No subject",
      actor: contact.email || contact.name || "Unknown",
    }));

    const blogLogs: ActivityLog[] = posts.map((post) => ({
      id: `blog-${post.id}`,
      type: "blog",
      createdAt: post.created_at,
      title: `Blog post ${post.is_published ? "published" : "draft"}`,
      description: post.title || "Untitled post",
      actor: post.author || "Editorial",
    }));

    return [...agentLogs, ...enquiryLogs, ...reviewLogs, ...contactLogs, ...blogLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [agents, contacts, enquiries, posts, reviews]);

  const filteredEntries = entries.filter((entry) => filter === "all" || entry.type === filter);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">System activity logs</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Live activity feed across agent profiles, enquiries, reviews, contacts, and blog content.
        </p>
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      <section className="flex flex-wrap items-end justify-between gap-3">
        <Select
          label="Filter by type"
          value={filter}
          onChange={(event) => setFilter(event.target.value as LogType)}
          options={[
            { value: "all", label: "All activity" },
            { value: "agent", label: "Agents" },
            { value: "enquiry", label: "Enquiries" },
            { value: "review", label: "Reviews" },
            { value: "contact", label: "Contact submissions" },
            { value: "blog", label: "Blog posts" },
          ]}
        />
        <Button variant="secondary" onClick={loadLogs}>
          Refresh
        </Button>
      </section>

      {error ? <ErrorState description={error} onRetry={loadLogs} /> : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-2 h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && filteredEntries.length === 0 ? (
        <EmptyState
          title="No activity available"
          description="No log entries match this filter."
          actionLabel="Clear filter"
          onAction={() => setFilter("all")}
        />
      ) : null}

      {!loading && filteredEntries.length > 0 ? (
        <div className="space-y-2">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-subheading">{entry.title}</h2>
                    <span className="rounded-full border border-border-light bg-surface-2 px-2 py-1 font-mono text-caption uppercase text-text-secondary">
                      {entry.type}
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm text-text-secondary">{entry.description}</p>
                  <p className="text-caption text-text-muted">Actor: {entry.actor}</p>
                </div>
                <p className="font-mono text-caption text-text-muted">
                  {new Date(entry.createdAt).toLocaleString("en-AU")}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
