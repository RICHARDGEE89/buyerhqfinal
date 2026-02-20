import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, Scale, ShieldCheck } from "lucide-react";

import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Why BuyerHQ | BuyerHQ",
  description:
    "Understand BuyerHQ's buyer-first model: verification workflows, transparent profile context, and brokered introductions.",
};

const pillars = [
  {
    title: "Verification Standards",
    description:
      "Profiles pass through trust and moderation workflows before verification signals are surfaced publicly.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent Context",
    description:
      "BuyerHQ presents practical profile context so buyers can compare fit quickly and confidently.",
    icon: Scale,
  },
  {
    title: "Buyer-First Workflow",
    description:
      "BuyerHQ supports structured, brokered introductions designed around buyer clarity from shortlist to first contact.",
    icon: Award,
  },
];

const standards = [
  "Profile quality and integrity checks",
  "Verification and moderation controls",
  "Review signal governance",
  "Ongoing listing quality monitoring",
];

export default function WhyBuyerHQPage() {
  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">The BuyerHQ Advantage</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
            Built for Integrity. Designed for Buyers.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            BuyerHQ was built to improve trust and clarity in buyer representation by combining verification signals,
            transparent profile context, and structured introduction workflows.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <pillar.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h2 className="font-display text-xl font-bold text-navy">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto grid max-w-5xl gap-10 px-4 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="font-display text-3xl font-bold text-navy">What verification means in practice</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              BuyerHQ prioritises trust and consistency in listing quality. Verification signals are supported by
              structured workflow controls before they are displayed in the directory.
            </p>
            <ul className="mt-4 space-y-2">
              {standards.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-xl font-bold text-navy">Ready to find your shortlist?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start with the directory or run the match quiz to align with verified specialists in your target areas.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/find-agents"
                className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                Browse Agents <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/match-quiz"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
              >
                Take Match Quiz
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
              >
                Buyer Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
