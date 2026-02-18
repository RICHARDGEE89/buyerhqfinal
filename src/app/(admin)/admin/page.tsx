"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import type { AgentRow, BlogPostRow, EnquiryRow, ReviewRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type ContactSubmission = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  is_resolved: boolean;
};

export default function AdminDashboardOverview() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      const [agentsRes, enquiriesRes, reviewsRes, postsRes, contactsRes] = await Promise.all([
        supabase.from("agents").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*")
          .eq("is_approved", false)
          .order("created_at", { ascending: false }),
        supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      if (cancelled) return;
      if (agentsRes.error || enquiriesRes.error || reviewsRes.error || postsRes.error || contactsRes.error) {
        setError(
          agentsRes.error?.message ||
            enquiriesRes.error?.message ||
            reviewsRes.error?.message ||
            postsRes.error?.message ||
            contactsRes.error?.message ||
            "Failed to load admin data"
        );
      }

      setAgents(agentsRes.data ?? []);
      setEnquiries(enquiriesRes.data ?? []);
      setReviews(reviewsRes.data ?? []);
      setPosts(postsRes.data ?? []);
      setContacts((contactsRes.data as ContactSubmission[]) ?? []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const newThisMonth = enquiries.filter((item) => new Date(item.created_at) >= monthStart).length;

  const updateAgent = async (id: string, field: "is_verified" | "is_active", value: boolean) => {
    await supabase.from("agents").update({ [field]: value }).eq("id", id);
    setAgents((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const deleteAgent = async (id: string) => {
    await supabase.from("agents").delete().eq("id", id);
    setAgents((current) => current.filter((item) => item.id !== id));
  };

  const approveReview = async (id: string) => {
    await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    setReviews((current) => current.filter((item) => item.id !== id));
  };

  const rejectReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    setReviews((current) => current.filter((item) => item.id !== id));
  };

  const togglePublished = async (id: string, value: boolean) => {
    await supabase.from("blog_posts").update({ is_published: value }).eq("id", id);
    setPosts((current) => current.map((item) => (item.id === id ? { ...item, is_published: value } : item)));
  };

  const deletePost = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    setPosts((current) => current.filter((item) => item.id !== id));
  };

  if (loading) return <div className="text-body text-text-secondary">Loading admin dashboard...</div>;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Admin Console</h1>
        <p className="mt-2 text-body-sm text-text-secondary">Platform moderation and operational controls.</p>
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

