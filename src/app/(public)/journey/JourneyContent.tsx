"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle, Circle } from "lucide-react";

import { LoginRequiredCard } from "@/components/auth/LoginRequiredCard";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";

type JourneyItem = {
  id: string;
  text: string;
  href?: string;
};

const stages: Array<{ id: string; title: string; description: string; items: JourneyItem[] }> = [
  {
    id: "ready",
    title: "01 · Getting Ready",
    description: "Define budget, suburbs, and timeline before searching.",
    items: [
      { id: "r1", text: "Confirm budget and buying costs", href: "/tools" },
      { id: "r2", text: "Shortlist target suburbs", href: "/suburbs" },
      { id: "r3", text: "Set your buying timeline" },
      { id: "r4", text: "Document your non-negotiables" },
    ],
  },
  {
    id: "match",
    title: "02 · Finding Your Agent",
    description: "Match with verified specialists and compare profiles.",
    items: [
      { id: "m1", text: "Take the match quiz", href: "/match-quiz" },
      { id: "m2", text: "Review top agent profiles", href: "/find-agents" },
      { id: "m3", text: "Compare fees and specialisations" },
      { id: "m4", text: "Send your first enquiry" },
    ],
  },
  {
    id: "search",
    title: "03 · Active Search",
    description: "Review opportunities and narrow your shortlist.",
    items: [
      { id: "s1", text: "Inspect shortlisted properties" },
      { id: "s2", text: "Validate property risks and due diligence" },
      { id: "s3", text: "Assess value against comparable sales" },
      { id: "s4", text: "Prepare offer strategy with your agent" },
    ],
  },
  {
    id: "offer",
    title: "04 · Offer & Negotiation",
    description: "Move decisively with a clear walk-away number.",
    items: [
      { id: "o1", text: "Set walk-away price and terms", href: "/tools" },
      { id: "o2", text: "Submit offer or auction plan" },
      { id: "o3", text: "Negotiate contract and conditions" },
      { id: "o4", text: "Sign contract and pay deposit" },
    ],
  },
  {
    id: "settle",
    title: "05 · Settlement",
    description: "Close out finance, legal checks, and handover.",
    items: [
      { id: "se1", text: "Finalise finance and lender requirements" },
      { id: "se2", text: "Complete legal and conveyancing checks" },
      { id: "se3", text: "Run pre-settlement inspection" },
      { id: "se4", text: "Settle and collect keys" },
    ],
  },
];

const storageKey = "buyerhq-journey-progress-v1";

export default function JourneyContent() {
  const supabase = useMemo(() => createClient(), []);
  const [authResolved, setAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        setChecked(new Set(JSON.parse(raw) as string[]));
      }
    } catch {
      setChecked(new Set());
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(checked)));
  }, [checked]);

  useEffect(() => {
    const hydrateUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(Boolean(user));
      setAuthResolved(true);
    };
    void hydrateUser();
  }, [supabase]);

  const allItems = useMemo(() => stages.flatMap((stage) => stage.items), []);
  const doneCount = allItems.filter((item) => checked.has(item.id)).length;
  const progress = allItems.length > 0 ? Math.round((doneCount / allItems.length) * 100) : 0;
  const isComplete = progress === 100;

  const toggleItem = (id: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="py-12">
      <div
        className="bg-navy px-4 py-14"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Buyer Planning</p>
          <h1 className="font-display text-4xl font-bold text-white">Your Buyer Journey Tracker</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
            Keep track of each stage from early prep through to settlement. Progress is saved on this device.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-lg border border-border bg-card p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              {doneCount} of {allItems.length} tasks complete
            </p>
            <p className="text-sm font-bold text-navy">{progress}%</p>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {stages.map((stage) => (
            <section key={stage.id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-lg font-bold text-navy">{stage.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
              <div className="mt-4 space-y-2">
                {stage.items.map((item) => {
                  const done = checked.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2"
                    >
                      <button
                        type="button"
                        aria-label={done ? "Mark incomplete" : "Mark complete"}
                        onClick={() => toggleItem(item.id)}
                        className="mt-0.5 text-muted-foreground hover:text-foreground"
                      >
                        {done ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                          {item.text}
                        </p>
                        {item.href && !done ? (
                          <Link
                            href={item.href}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-navy"
                          >
                            Open resource <ArrowRight className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {isComplete ? (
          <section className="mt-4">
            {!authResolved ? (
              <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground shadow-card">
                Checking your account...
              </div>
            ) : isAuthenticated ? (
              <div className="rounded-lg border border-border bg-card p-5 shadow-card">
                <h2 className="font-display text-xl font-bold text-navy">Journey complete</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Great work. Your milestone completion is unlocked and ready in your buyer dashboard.
                </p>
                <div className="mt-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
                  >
                    Open dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <LoginRequiredCard
                title="Sign in to unlock your completed journey summary"
                description="Create or sign in to a buyer account to save progress beyond this device."
                nextPath="/journey"
              />
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
