"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";

type ArchetypeKey = "researcher" | "decisive" | "investor" | "family";

const archetypes: Record<
  ArchetypeKey,
  { title: string; summary: string; bestSpec: string; nextStep: string }
> = {
  researcher: {
    title: "The Researcher",
    summary: "Data-driven and methodical. You value analysis, comparisons, and confidence before acting.",
    bestSpec: "Investment Strategy",
    nextStep: "Prioritise agents with strong due diligence and valuation frameworks.",
  },
  decisive: {
    title: "The Decisive Buyer",
    summary: "Fast-moving and execution-focused. You prefer clear recommendations and quick action.",
    bestSpec: "Auction Bidding",
    nextStep: "Prioritise agents with strong negotiation velocity and auction experience.",
  },
  investor: {
    title: "The Strategic Investor",
    summary: "Long-term and risk-aware. You focus on fundamentals, returns, and downside protection.",
    bestSpec: "Investment Strategy",
    nextStep: "Prioritise agents with proven investor outcomes and suburb-level data.",
  },
  family: {
    title: "The Lifestyle & Family Buyer",
    summary: "You optimise for liveability, schooling, and community fit in addition to value.",
    bestSpec: "First Home Buyers",
    nextStep: "Prioritise agents with local area depth and strong buyer communication.",
  },
};

const questions: Array<{
  id: string;
  text: string;
  options: Array<{ value: string; label: string; score: Partial<Record<ArchetypeKey, number>> }>;
}> = [
  {
    id: "q1",
    text: "How do you usually make major buying decisions?",
    options: [
      { value: "a", label: "I research heavily before deciding", score: { researcher: 3, investor: 2 } },
      { value: "b", label: "I move quickly once I see the right fit", score: { decisive: 3 } },
      { value: "c", label: "I weigh both value and long-term returns", score: { investor: 3, researcher: 1 } },
      { value: "d", label: "I focus on lifestyle and family needs first", score: { family: 3 } },
    ],
  },
  {
    id: "q2",
    text: "What matters most about your target suburb?",
    options: [
      { value: "a", label: "Comparable sales and growth trajectory", score: { researcher: 2, investor: 3 } },
      { value: "b", label: "Competition and ability to secure quickly", score: { decisive: 3 } },
      { value: "c", label: "Yield, vacancy, and long-term demand", score: { investor: 3 } },
      { value: "d", label: "School zones, amenity, and day-to-day fit", score: { family: 3 } },
    ],
  },
  {
    id: "q3",
    text: "How involved do you want to be in agent decisions?",
    options: [
      { value: "a", label: "Very involved - show me all evidence", score: { researcher: 3 } },
      { value: "b", label: "Guide me, then I’ll decide fast", score: { decisive: 3 } },
      { value: "c", label: "I want strategic recommendations with trade-offs", score: { investor: 2, researcher: 1 } },
      { value: "d", label: "I need clarity and steady support throughout", score: { family: 2 } },
    ],
  },
  {
    id: "q4",
    text: "Which risk worries you most?",
    options: [
      { value: "a", label: "Overpaying due to weak data", score: { researcher: 3 } },
      { value: "b", label: "Missing the right property by waiting", score: { decisive: 3 } },
      { value: "c", label: "Buying an asset with poor fundamentals", score: { investor: 3 } },
      { value: "d", label: "Choosing the wrong area for our lifestyle", score: { family: 3 } },
    ],
  },
  {
    id: "q5",
    text: "What outcome are you targeting first?",
    options: [
      { value: "a", label: "Confidence in value and quality", score: { researcher: 2 } },
      { value: "b", label: "Securing the property quickly", score: { decisive: 2 } },
      { value: "c", label: "Long-term performance and resilience", score: { investor: 3 } },
      { value: "d", label: "A home that fits our life stage", score: { family: 3 } },
    ],
  },
];

export default function BuyerProfileContent() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isComplete = step >= questions.length;

  const result = useMemo(() => {
    const scores: Record<ArchetypeKey, number> = {
      researcher: 0,
      decisive: 0,
      investor: 0,
      family: 0,
    };

    for (const question of questions) {
      const selected = answers[question.id];
      const option = question.options.find((item) => item.value === selected);
      if (!option) continue;
      for (const [key, value] of Object.entries(option.score) as Array<[ArchetypeKey, number]>) {
        scores[key] += value;
      }
    }

    const winner = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "researcher") as ArchetypeKey;
    return {
      scores,
      winner,
      profile: archetypes[winner],
    };
  }, [answers]);

  const current = questions[step];

  return (
    <div className="py-12">
      <div
        className="bg-navy px-4 py-14"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Buyer Intelligence</p>
          <h1 className="font-display text-4xl font-bold text-white">Your Buyer DNA Profile</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Five quick questions to identify your buying style and the type of specialist to prioritise.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-8">
        {!isComplete ? (
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Question {step + 1} of {questions.length}
            </p>
            <h2 className="font-display text-2xl font-bold text-navy">{current.text}</h2>
            <div className="mt-5 space-y-2">
              {current.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [current.id]: option.value }));
                    setStep((prev) => prev + 1);
                  }}
                  className="w-full rounded-md border border-border bg-muted/30 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-navy hover:bg-muted"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {step > 0 ? (
              <button
                onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                className="mt-4 text-xs text-muted-foreground underline underline-offset-2 hover:text-navy"
              >
                Back
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your Archetype</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-navy">{result.profile.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.profile.summary}</p>
              <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Best-fit specialisation
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{result.profile.bestSpec}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommended next step</p>
                  <p className="mt-1 text-sm text-foreground">{result.profile.nextStep}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/find-agents?specialization=${encodeURIComponent(result.profile.bestSpec)}&verified=true`}
                className="inline-flex items-center justify-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                Find Matching Agents <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/match-quiz"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
              >
                Run Full Match Quiz
              </Link>
              <button
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                }}
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
