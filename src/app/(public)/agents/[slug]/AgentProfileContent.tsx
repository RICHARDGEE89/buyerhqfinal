"use client";

import Link from "next/link";
import { useState } from "react";

import type { AgentRow, ReviewRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Rating } from "@/components/ui/Rating";
import { Textarea } from "@/components/ui/Textarea";

export default function AgentProfileContent({
  agent,
  reviews,
}: {
  agent: AgentRow;
  reviews: ReviewRow[];
}) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmitEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!buyerName.trim() || !buyerEmail.trim() || !message.trim()) {
      setError("Name, email and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agent.id,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          message,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to submit enquiry.");
      } else {
        setSuccess(true);
        setBuyerName("");
        setBuyerEmail("");
        setBuyerPhone("");
        setMessage("");
      }
    } catch {
      setError("Unable to submit enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <nav className="font-mono text-caption text-text-secondary">
        <Link href="/" className="hover:text-text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/agents" className="hover:text-text-primary">
          Find Agents
        </Link>{" "}
        / <span className="text-text-primary">{agent.name}</span>
      </nav>

      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={agent.name} src={agent.avatar_url} size="lg" />
            <div>
              <h1 className="text-display text-text-primary">{agent.name}</h1>
              <p className="text-body text-text-secondary">{agent.agency_name ?? "Independent Advisor"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
            {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Rating</p>
          <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Reviews</p>
          <p className="text-heading text-text-primary">{agent.review_count ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Experience</p>
          <p className="text-heading text-text-primary">{agent.years_experience ?? 0} years</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-label uppercase text-text-secondary">Properties Purchased</p>
          <p className="text-heading text-text-primary">{agent.properties_purchased ?? 0}</p>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card className="p-5">
            <h2 className="text-heading">About</h2>
            <p className="mt-2 text-body text-text-secondary">{agent.bio ?? "Profile bio pending."}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Specializations</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(agent.specializations ?? []).map((item) => (
                <Badge key={item} variant="specialization">
                  {item}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Target Suburbs</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(agent.suburbs ?? []).length === 0 ? (
                <Badge variant="state">Australia-wide coverage</Badge>
              ) : (
                (agent.suburbs ?? []).map((suburb) => (
                  <Badge key={suburb} variant="state">
                    {suburb}
                  </Badge>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Reviews</h2>
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-md border border-border p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-body-sm text-text-primary">{review.buyer_name ?? "Verified Buyer"}</p>
                    <Rating value={review.rating} />
                  </div>
                  <p className="text-body-sm text-text-secondary">{review.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-5">
          <h2 className="text-heading">Enquire</h2>
          <form className="mt-3 space-y-3" onSubmit={onSubmitEnquiry}>
            <Input label="Name" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} />
            <Input
              label="Email"
              type="email"
              value={buyerEmail}
              onChange={(event) => setBuyerEmail(event.target.value)}
            />
            <Input
              label="Phone (optional)"
              value={buyerPhone}
              onChange={(event) => setBuyerPhone(event.target.value)}
            />
            <Textarea
              label="Message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <div className="rounded-md border border-border bg-surface-2 p-3">
              <p className="font-mono text-label uppercase text-text-secondary">Fee Structure</p>
              <p className="mt-1 text-body-sm text-text-primary">
                {agent.fee_structure ?? "Fee details shared on enquiry."}
              </p>
            </div>

            {error ? <p className="text-caption text-destructive">{error}</p> : null}
            {success ? <p className="text-caption text-success">Enquiry submitted successfully.</p> : null}

            <Button type="submit" loading={submitting} disabled={submitting}>
              Send Enquiry
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
}
