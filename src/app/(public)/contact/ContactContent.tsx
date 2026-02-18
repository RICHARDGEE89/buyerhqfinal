"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setError("Please complete all fields.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to send message.");
      } else {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setError("Unable to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container space-y-8 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">Contact BuyerHQ</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">
          Send us a message and we&apos;ll get back to you as soon as possible.
        </p>
      </section>

      <Card className="p-5 md:p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Select
            label="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Select a subject"
            options={[
              { value: "General", label: "General" },
              { value: "Agent Enquiry", label: "Agent Enquiry" },
              { value: "List My Agency", label: "List My Agency" },
              { value: "Technical Issue", label: "Technical Issue" },
              { value: "Other", label: "Other" },
            ]}
          />
          <Textarea
            label="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />

          {error ? <p className="text-caption text-destructive">{error}</p> : null}
          {success ? (
            <p className="text-caption text-success">
              Message received. We&apos;ll respond within 1 business day.
            </p>
          ) : null}

          <Button type="submit" loading={loading} disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

