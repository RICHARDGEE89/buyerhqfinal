"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle, Send, Shield, Star } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";
import type { AgentRow } from "@/lib/database.types";
import { toPublicAgentView } from "@/lib/public-agent";

type LocationSuggestion = {
  suburb: string;
  state: string;
  postcode: string;
};

type EnquiryFormState = {
  name: string;
  email: string;
  phone: string;
  suburb: string;
  budget: string;
  timeline: string;
  contact: string;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const budgetOptions = [
  "Under $500K",
  "$500K - $800K",
  "$800K - $1.2M",
  "$1.2M - $2M",
  "$2M+",
];

const timelineOptions = ["ASAP", "0-3 months", "3-6 months", "6-12 months", "Just exploring"];
const contactOptions = ["Email", "Phone", "Either"];

export default function EnquiryFormContent({ agent }: { agent: AgentRow }) {
  const supabase = useMemo(() => createClient(), []);
  const mapped = useMemo(() => toPublicAgentView(agent), [agent]);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState<EnquiryFormState>({
    name: "",
    email: "",
    phone: "",
    suburb: "",
    budget: "",
    timeline: "",
    contact: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormState, string>>>({});

  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const hydrateUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const firstName = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
      const lastName = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";
      const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
      const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";

      setForm((current) => ({
        ...current,
        name: current.name || fullName,
        email: current.email || user.email || "",
        phone: current.phone || phone,
      }));
    };

    void hydrateUser();
  }, [supabase]);

  useEffect(() => {
    const query = form.suburb.trim();
    const selectedLabel = selectedLocation
      ? `${selectedLocation.suburb} ${selectedLocation.postcode}`.trim().toLowerCase()
      : "";
    if (!query || query.toLowerCase() === selectedLabel) {
      setLocationSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "8" });
        const response = await fetch(`/api/suburbs?${params.toString()}`);
        const data = (await response.json()) as { suggestions?: LocationSuggestion[] };
        if (!cancelled) {
          setLocationSuggestions(data.suggestions ?? []);
        }
      } catch {
        if (!cancelled) setLocationSuggestions([]);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [form.suburb, selectedLocation]);

  const setField = <K extends keyof EnquiryFormState>(field: K, value: EnquiryFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof EnquiryFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim() || !emailPattern.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (!form.message.trim()) nextErrors.message = "Please add a short message.";
    return nextErrors;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const targetSuburbs = selectedLocation?.suburb
      ? [selectedLocation.suburb]
      : form.suburb.trim()
        ? [form.suburb.trim()]
        : [];

    const detailLines = [
      `Budget range: ${form.budget || "Not specified"}`,
      `Timeline: ${form.timeline || "Not specified"}`,
      `Preferred contact: ${form.contact || "Not specified"}`,
      `Location preference: ${
        selectedLocation
          ? `${selectedLocation.suburb}, ${selectedLocation.state} ${selectedLocation.postcode}`
          : form.suburb || "Not specified"
      }`,
      "",
      form.message.trim(),
    ];

    setSubmitting(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: mapped.id,
          buyer_name: form.name.trim(),
          buyer_email: form.email.trim(),
          buyer_phone: form.phone.trim() || undefined,
          property_type: "Direct Enquiry",
          target_suburbs: targetSuburbs,
          message: detailLines.join("\n"),
        }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setSubmitError(result.error ?? "Unable to send enquiry right now.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Unable to send enquiry right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CheckCircle className="h-8 w-8 text-navy" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy">Enquiry Sent</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            BuyerHQ has received your enquiry for <strong className="text-foreground">{mapped.name}</strong>. We&apos;ll
            broker the introduction and coordinate next steps with the agent.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/agents/${mapped.slug || mapped.id}`}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
            >
              Back to Profile
            </Link>
            <Link
              href="/find-agents"
              className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Browse More Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-12"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto max-w-3xl">
          <Link
            href={`/agents/${mapped.slug || mapped.id}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Link>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">Enquire About {mapped.name}</h1>
          <p className="mt-2 text-sm text-white/60">Your details are shared only with this agent through BuyerHQ.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
            {mapped.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm font-bold text-navy">{mapped.name}</p>
            <p className="text-xs text-muted-foreground">
              {mapped.company} · {mapped.suburb}, {mapped.state}
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-sm font-semibold text-foreground">
              <Star className="h-4 w-4 fill-foreground text-foreground" />
              {mapped.rating.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">{mapped.reviewCount} reviews</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full Name *"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              error={errors.name}
              maxLength={120}
            />
            <Input
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              error={errors.email}
              maxLength={255}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              maxLength={20}
            />
            <Input
              label="Target Suburb or Postcode"
              value={form.suburb}
              onChange={(event) => {
                setField("suburb", event.target.value);
                setSelectedLocation(null);
              }}
              helperText="Autocomplete supports both suburb names and postcodes."
            />
          </div>

          {selectedLocation ? (
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Selected: {selectedLocation.suburb}, {selectedLocation.state} ({selectedLocation.postcode})
              </span>
              <button
                type="button"
                className="text-foreground underline underline-offset-2"
                onClick={() => {
                  setSelectedLocation(null);
                  setField("suburb", "");
                }}
              >
                Clear
              </button>
            </div>
          ) : null}

          {loadingSuggestions ? <p className="text-xs text-muted-foreground">Loading suburb suggestions...</p> : null}
          {locationSuggestions.length > 0 ? (
            <div className="max-h-48 overflow-auto rounded-md border border-border bg-surface-2">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.suburb}-${suggestion.state}-${suggestion.postcode}`}
                  type="button"
                  className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground last:border-b-0"
                  onClick={() => {
                    setSelectedLocation(suggestion);
                    setField("suburb", `${suggestion.suburb} ${suggestion.postcode}`);
                    setLocationSuggestions([]);
                  }}
                >
                  <span>
                    {suggestion.suburb}, {suggestion.state}
                  </span>
                  <span className="text-xs text-text-muted">{suggestion.postcode}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Budget Range"
              value={form.budget}
              onChange={(event) => setField("budget", event.target.value)}
              options={budgetOptions.map((option) => ({ label: option, value: option }))}
              placeholder="Select budget"
            />
            <Select
              label="Purchase Timeline"
              value={form.timeline}
              onChange={(event) => setField("timeline", event.target.value)}
              options={timelineOptions.map((option) => ({ label: option, value: option }))}
              placeholder="Select timeline"
            />
            <Select
              label="Preferred Contact"
              value={form.contact}
              onChange={(event) => setField("contact", event.target.value)}
              options={contactOptions.map((option) => ({ label: option, value: option }))}
              placeholder="Select method"
            />
          </div>

          <Textarea
            label="Your Message *"
            value={form.message}
            onChange={(event) => setField("message", event.target.value)}
            error={errors.message}
            placeholder="Share your goals, timeline, and any property requirements."
            maxLength={1200}
          />

          <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <p>
                BuyerHQ brokers all introductions. Your details are only shared with <strong>{mapped.name}</strong> to
                progress your request.
              </p>
            </div>
          </div>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

          <Button type="submit" loading={submitting} disabled={submitting}>
            <Send className="h-4 w-4" />
            {submitting ? "Sending..." : `Send Enquiry to ${mapped.name}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
