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
import type { AgentRow } from "@/lib/database.types";

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

export default function QuizContent() {
  const [step, setStep] = useState(0);
  const [buyType, setBuyType] = useState("");
  const [budget, setBudget] = useState("");
  const [state, setState] = useState("");
  const [targetSuburb, setTargetSuburb] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);

  const [matches, setMatches] = useState<AgentRow[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const progress = ((step + 1) / steps.length) * 100;
  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(buyType);
    if (step === 1) return Boolean(budget);
    if (step === 2) return Boolean(state);
    if (step === 3) return true;
    if (step === 4) return priorities.length > 0;
    return false;
  }, [budget, buyType, priorities.length, state, step]);

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
        if (targetSuburb.trim()) params.set("search", targetSuburb.trim());
        if (mappedSpecializations.length) params.set("specializations", mappedSpecializations.join(","));

        const response = await fetch(`/api/agents?${params.toString()}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to load matches");

        let nextMatches = (data.agents ?? []).slice(0, 6);

        // Fallback: if constraints are too strict, retry with broader filters.
        if (nextMatches.length === 0) {
          const fallbackParams = new URLSearchParams({
            state,
            verified: "true",
            limit: "6",
            page: "1",
          });
          const fallbackResponse = await fetch(`/api/agents?${fallbackParams.toString()}`);
          const fallbackData = await fallbackResponse.json();
          if (fallbackResponse.ok) {
            nextMatches = (fallbackData.agents ?? []).slice(0, 6);
          }
        }

        setMatches(nextMatches);
      } catch (error) {
        setMatchError(error instanceof Error ? error.message : "Unable to load matches");
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [priorities, state, step, targetSuburb]);

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
          <div className="mt-4">
            <Input
              label="Target suburb or postcode (optional)"
              value={targetSuburb}
              onChange={(event) => setTargetSuburb(event.target.value)}
              placeholder="e.g. Newtown or 2000"
            />
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
              <div className="grid gap-3 md:grid-cols-2">
                {matches.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
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
