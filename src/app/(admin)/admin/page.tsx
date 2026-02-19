"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import type { AgentRow, BlogPostRow, EnquiryRow, ReviewRow } from "@/lib/database.types";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";

type ContactSubmission = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  is_resolved: boolean;
};

function isQuizBrokeredEnquiry(enquiry: EnquiryRow) {
  const propertyType = (enquiry.property_type ?? "").toLowerCase();
  const message = enquiry.message ?? "";
  return propertyType === "quiz match request" || message.includes("Quiz match request via BuyerHQ.");
}

function extractBuyerMessage(message: string | null) {
  if (!message) return "No message provided.";
  const marker = "Buyer message:";
  const markerIndex = message.indexOf(marker);
  if (markerIndex === -1) return message;
  const extracted = message.slice(markerIndex + marker.length).trim();
  const brokerMarker = extracted.indexOf("Broker workflow:");
  return brokerMarker === -1 ? extracted : extracted.slice(0, brokerMarker).trim();
}

export default function AdminDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [schemaFallback, setSchemaFallback] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchAdminPanelData();
        if (cancelled) return;
        setAgents(payload.agents);
        setEnquiries(payload.enquiries);
        setReviews(payload.reviews.filter((item) => !item.is_approved));
        setPosts(payload.posts);
        setContacts(payload.contacts.slice(0, 10) as ContactSubmission[]);
        setSchemaFallback(Boolean(payload.schemaFallback));
        setWarning(payload.warning ?? null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load admin data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const newThisMonth = enquiries.filter((item) => new Date(item.created_at) >= monthStart).length;
  const quizEnquiries = useMemo(() => enquiries.filter(isQuizBrokeredEnquiry).slice(0, 12), [enquiries]);
  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    agents.forEach((agent) => {
      map.set(agent.id, agent.name);
    });
    return map;
  }, [agents]);

  const updateAgent = async (id: string, field: "is_verified" | "is_active", value: boolean) => {
    try {
      await runAdminAction({ type: "update_agent", id, patch: { [field]: value } });
      setAgents((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update agent.");
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await runAdminAction({ type: "delete_agent", id });
      setAgents((current) => current.filter((item) => item.id !== id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete agent.");
    }
  };

  const approveReview = async (id: string) => {
    try {
      await runAdminAction({ type: "approve_review", id });
      setReviews((current) => current.filter((item) => item.id !== id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to approve review.");
    }
  };

  const rejectReview = async (id: string) => {
    try {
      await runAdminAction({ type: "reject_review", id });
      setReviews((current) => current.filter((item) => item.id !== id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to reject review.");
    }
  };

  const togglePublished = async (id: string, value: boolean) => {
    try {
      await runAdminAction({ type: "toggle_post_published", id, value });
      setPosts((current) =>
        current.map((item) => (item.id === id ? { ...item, is_published: value } : item))
      );
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update blog post.");
    }
  };

  const deletePost = async (id: string) => {
    try {
      await runAdminAction({ type: "delete_post", id });
      setPosts((current) => current.filter((item) => item.id !== id));
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete blog post.");
    }
  };

  if (loading) return <div className="text-body text-text-secondary">Loading admin dashboard...</div>;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Admin Console</h1>
        <p className="mt-2 text-body-sm text-text-secondary">Platform moderation and operational controls.</p>
        {schemaFallback ? (
          <p className="mt-2 text-caption text-text-muted">
            Running in compatibility mode. Some advanced settings are using fallback storage.
          </p>
        ) : null}
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total Agents" value={agents.length} />
        <StatCard label="Verified Agents" value={agents.filter((item) => item.is_verified).length} />
        <StatCard label="Pending Verification" value={agents.filter((item) => !item.is_verified).length} />
        <StatCard label="Total Enquiries" value={enquiries.length} />
        <StatCard label="New This Month" value={newThisMonth} />
      </section>

      <section className="flex flex-wrap gap-2">
        <Button variant="secondary" asChild>
          <Link href="/admin/verifications">Open verifications</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/agents">Manage agents</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/users">Manage users</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/logs">View logs</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/settings">Admin settings</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/review-sources">Review sources</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/admin/broker-console">Broker console</Link>
        </Button>
      </section>

      <section>
        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Quiz enquiries (brokered handoff queue)</h2>
          <p className="text-body-sm text-text-secondary">
            These requests come from the final quiz step. BuyerHQ coordinates the agent conversation as middleman.
          </p>
          {quizEnquiries.length === 0 ? (
            <EmptyState title="No quiz enquiries yet" />
          ) : (
            <div className="space-y-2">
              {quizEnquiries.map((enquiry) => (
                <div key={enquiry.id} className="rounded-md border border-border p-3">
                  <p className="text-body-sm text-text-primary">
                    {enquiry.buyer_name} · {enquiry.buyer_email}
                  </p>
                  <p className="text-caption text-text-secondary">
                    Agent: {agentNameById.get(enquiry.agent_id) ?? enquiry.agent_id} · Status: {enquiry.status ?? "new"}
                  </p>
                  <p className="text-caption text-text-secondary">
                    Phone: {enquiry.buyer_phone || "Not provided"} · Submitted{" "}
                    {new Date(enquiry.created_at).toLocaleString("en-AU")}
                  </p>
                  <p className="mt-2 rounded-md border border-border bg-surface-2 p-2 text-caption text-text-secondary">
                    {extractBuyerMessage(enquiry.message)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Recent contact submissions</h2>
          {contacts.length === 0 ? (
            <EmptyState title="No contact submissions" />
          ) : (
            <div className="space-y-2">
              {contacts.map((submission) => (
                <div key={submission.id} className="rounded-md border border-border p-3">
                  <p className="text-body-sm text-text-primary">
                    {submission.name || "Unknown"} · {submission.email || "No email"}
                  </p>
                  <p className="text-caption text-text-secondary">{submission.subject || "No subject"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Pending review moderation</h2>
          {reviews.length === 0 ? (
            <EmptyState title="No pending reviews" />
          ) : (
            <div className="space-y-2">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-md border border-border p-3">
                  <p className="text-body-sm text-text-primary">
                    {review.buyer_name || "Buyer"} · Rating {review.rating}/5
                  </p>
                  <p className="text-caption text-text-secondary">{review.comment || "No comment"}</p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="secondary" onClick={() => approveReview(review.id)}>
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => rejectReview(review.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Agent management</h2>
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="rounded-md border border-border p-3">
                <p className="text-body-sm text-text-primary">
                  {agent.name} · {agent.agency_name || "No agency"}
                </p>
                <p className="text-caption text-text-secondary">{agent.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => updateAgent(agent.id, "is_verified", !agent.is_verified)}
                  >
                    {agent.is_verified ? "Unverify" : "Verify"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => updateAgent(agent.id, "is_active", !agent.is_active)}
                  >
                    {agent.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="destructive" onClick={() => deleteAgent(agent.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Blog post management</h2>
          {posts.length === 0 ? (
            <EmptyState title="No blog posts" />
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="rounded-md border border-border p-3">
                  <p className="text-body-sm text-text-primary">{post.title}</p>
                  <p className="text-caption text-text-secondary">{post.slug}</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => togglePublished(post.id, !post.is_published)}
                    >
                      {post.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="destructive" onClick={() => deletePost(post.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

