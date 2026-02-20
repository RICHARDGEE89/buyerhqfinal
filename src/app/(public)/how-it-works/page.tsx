import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageSquare, Search, Shield, Star } from "lucide-react";

import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "How It Works | BuyerHQ",
  description: "Understand the BuyerHQ workflow from discovery through brokered introduction.",
};

const steps = [
  {
    num: "01",
    icon: Search,
    title: "Define Your Criteria",
    desc: "Set your location, budget range, and buying goals so the shortlist is aligned from day one.",
    points: ["State and suburb preferences", "Budget range and property type", "Timeline and buying urgency"],
    href: "/match-quiz",
    cta: "Take Match Quiz",
  },
  {
    num: "02",
    icon: Star,
    title: "Compare Verified Specialists",
    desc: "Review verified profiles with transparent context across experience, reviews, and service focus.",
    points: ["Verified profile controls", "Service and specialisation clarity", "Directory-wide comparison workflow"],
    href: "/find-agents",
    cta: "Browse Agents",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Enquire & Engage",
    desc: "Submit a brokered enquiry and BuyerHQ coordinates the introduction workflow with your shortlisted agent.",
    points: ["Structured introduction flow", "Buyer-provided brief passed through", "Managed communication handoff"],
    href: "/find-agents",
    cta: "Find an Agent",
  },
];

const verificationSteps = [
  { label: "Profile Integrity Checks", desc: "Listing quality and profile completeness standards are applied." },
  { label: "Verification Workflow", desc: "Verification controls are validated before trust status is shown." },
  { label: "Review Moderation", desc: "Approved review signals are surfaced across the public directory." },
  { label: "Continuous Monitoring", desc: "Profiles remain subject to ongoing quality and moderation checks." },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">The Process</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">How BuyerHQ Works</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/60 md:text-base">
            From first search to brokered introduction, BuyerHQ gives buyers a structured path to shortlist and engage.
          </p>
        </div>
      </div>

      <section className="bg-card py-20">
        <div className="container mx-auto max-w-5xl space-y-14 px-4">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className={`grid items-center gap-8 md:grid-cols-2 ${index % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""}`}
            >
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <span className="font-display text-5xl font-bold text-muted/50">{step.num}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-muted">
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold text-navy">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                <ul className="mt-3 space-y-2">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
                >
                  {step.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-lg bg-navy p-10 text-center text-white">
                <p className="font-display text-7xl font-bold text-white/10">{step.num}</p>
                <step.icon className="mx-auto my-4 h-14 w-14 text-white/45" />
                <p className="font-display text-xl font-bold text-white/90">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Trust Framework</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Verification Workflow</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              BuyerHQ applies a structured trust workflow before and after profiles are visible in the directory.
            </p>
          </div>
          <div className="space-y-4">
            {verificationSteps.map((item, index) => (
              <div key={item.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {index + 1}
                  </div>
                  {index < verificationSteps.length - 1 ? <div className="mt-2 h-full min-h-6 w-px bg-border" /> : null}
                </div>
                <article className="flex-1 rounded-lg border border-border bg-card p-4 shadow-card">
                  <h3 className="font-display text-base font-bold text-navy">{item.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-display text-xl font-bold text-navy">Ready to shortlist?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start with the match quiz or jump straight into the full directory.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/match-quiz"
              className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Start Match Quiz
            </Link>
            <Link
              href="/find-agents"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
