"use client";

import { useEffect, useMemo, useState } from "react";

import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AgentCardSkeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import type { AgentRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const steps = [
  "What are you looking to buy?",
  "What's your budget range?",
  "Which state are you buying in?",
  "Do you have a target suburb?",
  "What's most important to you?",
  "Your matched agents",
];

const purchaseTypeOptions = ["Home to live in", "Investment property", "Not sure yet"];
const budgetOptions = ["Under $500k", "$500k-$1M", "$1M-$2M", "$2M+"];
const stateOptions = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const priorityOptions = [
  "Price negotiation",
  "Off-market access",
  "Auction bidding",
  "Investment strategy",
  "First home guidance",
];

const specializationMap: Record<string, string> = {
  "Price negotiation": "Negotiation",
  "Off-market access": "Off-Market Access",
  "Auction bidding": "Auction Bidding",
  "Investment strategy": "Investment Strategy",
  "First home guidance": "First Home Buyers",
};

type LocationSuggestion = {
  suburb: string;
  state: string;
  postcode: string;
};

export default function QuizContent() {
  const supabase = useMemo(() => createClient(), []);
  const [preselectedAgentId, setPreselectedAgentId] = useState("");
  const [step, setStep] = useState(0);
  const [buyType, setBuyType] = useState("");
  const [budget, setBudget] = useState("");
  const [state, setState] = useState("");
  const [targetSuburb, setTargetSuburb] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [priorities, setPriorities] = useState<string[]>([]);

  const [matches, setMatches] = useState<AgentRow[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [enquiryResult, setEnquiryResult] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  const progress = ((step + 1) / steps.length) * 100;
  const selectedAgent = useMemo(
    () => matches.find((agent) => agent.id === selectedAgentId) ?? null,
    [matches, selectedAgentId]
  );
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(buyType);
    if (step === 1) return Boolean(budget);
    if (step === 2) return Boolean(state);
    if (step === 3) return true;
    if (step === 4) return priorities.length > 0;
    return false;
  }, [budget, buyType, priorities.length, state, step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const agentFromQuery = new URLSearchParams(window.location.search).get("agent")?.trim() ?? "";
    setPreselectedAgentId(agentFromQuery);
  }, []);

  useEffect(() => {
    const hydrateUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const first = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
      const last = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";
      const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
      const fullName = [first, last].filter(Boolean).join(" ").trim();
      if (fullName) setEnquiryName(fullName);
      if (user.email) setEnquiryEmail(user.email);
      if (phone) setEnquiryPhone(phone);
    };

    void hydrateUser();
  }, [supabase]);

  useEffect(() => {
    const query = targetSuburb.trim();
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
        const params = new URLSearchParams({ q: query, limit: "10" });
        if (state) params.set("state", state);
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
  }, [selectedLocation, state, targetSuburb]);

  useEffect(() => {
    if (step !== 5) return;

    const fetchMatches = async () => {
      setLoadingMatches(true);
      setMatchError(null);
      try {
        const mappedSpecializations = priorities.map((item) => specializationMap[item]).filter(Boolean);
        const params = new URLSearchParams({
          state,
          verified: "true",
          limit: "6",
          page: "1",
        });
        if (selectedLocation?.suburb) params.set("suburb", selectedLocation.suburb);
        if (selectedLocation?.postcode) params.set("postcode", selectedLocation.postcode);
        if (!selectedLocation && targetSuburb.trim()) params.set("location", targetSuburb.trim());
        if (mappedSpecializations.length) params.set("specializations", mappedSpecializations.join(","));

        const response = await fetch(`/api/agents?${params.toString()}`);
        const data = (await response.json()) as { agents?: AgentRow[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to load matches");

        let nextMatches: AgentRow[] = (data.agents ?? []).slice(0, 6);

        // Fallback: if constraints are too strict, retry with broader filters.
        if (nextMatches.length === 0) {
          const fallbackParams = new URLSearchParams({
            state,
            verified: "true",
            limit: "6",
            page: "1",
          });
          const fallbackResponse = await fetch(`/api/agents?${fallbackParams.toString()}`);
          const fallbackData = (await fallbackResponse.json()) as { agents?: AgentRow[] };
          if (fallbackResponse.ok) {
            nextMatches = (fallbackData.agents ?? []).slice(0, 6);
          }
        }

        setMatches(nextMatches);
        setSelectedAgentId((current) => {
          if (current && nextMatches.some((item) => item.id === current)) return current;
          if (preselectedAgentId && nextMatches.some((item) => item.id === preselectedAgentId)) {
            return preselectedAgentId;
          }
          return nextMatches[0]?.id ?? "";
        });
      } catch (error) {
        setMatchError(error instanceof Error ? error.message : "Unable to load matches");
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [preselectedAgentId, priorities, selectedLocation, state, step, targetSuburb]);

  const sendQuizEnquiry = async () => {
    setEnquiryError(null);
    setEnquiryResult(null);

    if (!selectedAgent) {
      setEnquiryError("Select a matched agent first.");
      return;
    }
    if (!enquiryName.trim() || !enquiryEmail.trim() || !enquiryMessage.trim()) {
      setEnquiryError("Your name, email, and message are required.");
      return;
    }

    const locationPreference = selectedLocation
      ? `${selectedLocation.suburb}, ${selectedLocation.state} ${selectedLocation.postcode}`
      : targetSuburb.trim() || "Not specified";

    const payload = {
      agent_id: selectedAgent.id,
      buyer_name: enquiryName.trim(),
      buyer_email: enquiryEmail.trim(),
      buyer_phone: enquiryPhone.trim() || undefined,
      property_type: "Quiz Match Request",
      target_suburbs: selectedLocation?.suburb ? [selectedLocation.suburb] : targetSuburb.trim() ? [targetSuburb] : [],
      message: [
        "Quiz match request via BuyerHQ.",
        `Buying brief: ${buyType || "Not specified"}`,
        `Budget range: ${budget || "Not specified"}`,
        `State: ${state || "Not specified"}`,
        `Location preference: ${locationPreference}`,
        `Priorities: ${priorities.join(", ") || "Not specified"}`,
        "",
        `Buyer message: ${enquiryMessage.trim()}`,
        "",
        "Broker workflow: BuyerHQ will contact the agent and coordinate next steps as middleman.",
      ].join("\n"),
    };

    setSubmittingEnquiry(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setEnquiryError(data.error ?? "Unable to send enquiry.");
      } else {
        setEnquiryResult(
          "Enquiry submitted. BuyerHQ will contact the agent separately and coordinate your introduction."
        );
      }
    } catch {
      setEnquiryError("Unable to send enquiry.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-label uppercase text-text-secondary">
            Step {step + 1} of {steps.length}
          </p>
          <p className="font-mono text-caption text-text-secondary">{Math.round(progress)}%</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <Card className="p-6 md:p-8">
        <h1 className="text-heading text-text-primary">{steps[step]}</h1>

        {step === 0 ? (
          <div className="mt-4 grid gap-2">
            {purchaseTypeOptions.map((option) => (
              <Button
                key={option}
                variant={buyType === option ? "primary" : "secondary"}
                onClick={() => setBuyType(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-4 grid gap-2">
            {budgetOptions.map((option) => (
              <Button
                key={option}
                variant={budget === option ? "primary" : "secondary"}
                onClick={() => setBudget(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4">
            <Select
              label="State"
              value={state}
              onChange={(event) => setState(event.target.value)}
              options={stateOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Select state"
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 space-y-2">
            <Input
              label="Target suburb or postcode (optional)"
              value={targetSuburb}
              onChange={(event) => {
                setTargetSuburb(event.target.value);
                setSelectedLocation(null);
              }}
              placeholder="e.g. Newtown or 2000"
              helperText="Autocomplete supports both postcode and suburb name."
            />
            {selectedLocation ? (
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
                <span>
                  Selected: {selectedLocation.suburb}, {selectedLocation.state} ({selectedLocation.postcode})
                </span>
                <button
                  type="button"
                  className="text-text-primary underline"
                  onClick={() => {
                    setSelectedLocation(null);
                    setTargetSuburb("");
                  }}
                >
                  Clear
                </button>
              </div>
            ) : null}
            {loadingSuggestions ? <p className="text-caption text-text-muted">Loading suggestions...</p> : null}
            {locationSuggestions.length > 0 ? (
              <div className="max-h-56 overflow-auto rounded-md border border-border bg-surface-2">
                {locationSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.suburb}-${suggestion.state}-${suggestion.postcode}`}
                    type="button"
                    className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-body-sm text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary last:border-b-0"
                    onClick={() => {
                      setSelectedLocation(suggestion);
                      setTargetSuburb(`${suggestion.suburb} ${suggestion.postcode}`);
                      setLocationSuggestions([]);
                    }}
                  >
                    <span>
                      {suggestion.suburb}, {suggestion.state}
                    </span>
                    <span className="font-mono text-caption text-text-muted">{suggestion.postcode}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-4 grid gap-2">
            {priorityOptions.map((option) => {
              const checked = priorities.includes(option);
              return (
                <Checkbox
                  key={option}
                  checked={checked}
                  label={option}
                  onChange={(nextChecked) => {
                    setPriorities((current) =>
                      nextChecked ? [...current, option] : current.filter((item) => item !== option)
                    );
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-4 space-y-3">
            {loadingMatches ? (
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <AgentCardSkeleton key={i} />
                ))}
              </div>
            ) : null}

            {matchError && !loadingMatches ? (
              <ErrorState description={matchError} onRetry={() => setStep(4)} />
            ) : null}

            {!loadingMatches && !matchError && matches.length === 0 ? (
              <EmptyState
                title="No matches yet"
                description="Try another suburb/postcode or selecting fewer constraints."
              />
            ) : null}

            {!loadingMatches && !matchError && matches.length > 0 ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {matches.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} showEnquiryAction={false} />
                  ))}
                </div>

                <Card className="space-y-3 border-border-light p-4">
                  <h2 className="text-subheading">Enquire with {selectedAgent?.name ?? "your matched agent"}</h2>
                  <p className="text-body-sm text-text-secondary">
                    BuyerHQ manages this introduction as middleman. We will contact the agent separately and coordinate
                    the next step with you.
                  </p>

                  <Select
                    label="Matched agent"
                    value={selectedAgentId}
                    onChange={(event) => setSelectedAgentId(event.target.value)}
                    options={matches.map((agent) => ({
                      value: agent.id,
                      label: `${agent.name} · ${agent.agency_name ?? "Independent Advisor"}`,
                    }))}
                    placeholder="Select matched agent"
                  />
                  <Input
                    label="Your Name"
                    value={enquiryName}
                    onChange={(event) => setEnquiryName(event.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={enquiryEmail}
                    onChange={(event) => setEnquiryEmail(event.target.value)}
                    helperText="Used for in-platform updates only. BuyerHQ handles outreach."
                  />
                  <Input
                    label="Phone (optional)"
                    value={enquiryPhone}
                    onChange={(event) => setEnquiryPhone(event.target.value)}
                  />
                  <Textarea
                    label="Message"
                    value={enquiryMessage}
                    onChange={(event) => setEnquiryMessage(event.target.value)}
                    placeholder="Share timeline, goals, and must-haves."
                  />

                  {enquiryError ? <p className="text-caption text-destructive">{enquiryError}</p> : null}
                  {enquiryResult ? <p className="text-caption text-success">{enquiryResult}</p> : null}

                  <Button loading={submittingEnquiry} disabled={submittingEnquiry} onClick={sendQuizEnquiry}>
                    Send Enquiry
                  </Button>
                </Card>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep((prev) => Math.min(prev + 1, 5))} disabled={!canContinue}>
              Next
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setStep(0)}>
              Restart
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
