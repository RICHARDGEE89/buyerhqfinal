import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, Handshake, Shield } from "lucide-react";

import { CTABanner } from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "About | BuyerHQ",
  description:
    "Learn why BuyerHQ exists, how verification works, and the principles behind our buyer-first platform.",
};

const pillars = [
  {
    icon: Shield,
    title: "Verification",
    description:
      "Every profile is screened through a trust and compliance workflow before BuyerHQ marks it verified.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Profiles surface practical details buyers need: service areas, focus areas, reviews, and fee context.",
  },
  {
    icon: Handshake,
    title: "Brokered Introductions",
    description:
      "BuyerHQ coordinates introductions so buyers and agents enter conversations with clarity and structure.",
  },
];

const team = [
  {
    name: "BuyerHQ Operations",
    role: "Platform Integrity",
    bio: "Maintains listing quality, profile standards, and moderation controls across the national directory.",
    initials: "BO",
  },
  {
    name: "Verification Team",
    role: "Agent Validation",
    bio: "Reviews profile evidence and ensures directory standards are applied consistently before visibility.",
    initials: "VT",
  },
  {
    name: "Buyer Success",
    role: "Introduction Support",
    bio: "Helps buyers progress from shortlist to first conversation with structured communication support.",
    initials: "BS",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Our Story</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">About BuyerHQ</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            BuyerHQ exists to make buyer representation easier to discover, compare, and trust across Australia while
            keeping every introduction client-focused and brokered through our platform.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto grid max-w-5xl gap-12 px-4 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mission</p>
            <h2 className="font-display text-3xl font-bold text-navy">Levelling the playing field for property buyers</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              BuyerHQ was built to reduce noise and improve confidence in high-stakes property decisions. We focus on
              trust signals, transparent profile context, and practical buyer workflows that help users move from
              search to action.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our model is buyer-first: verified profile intelligence plus managed introductions in one platform.
            </p>
            <Link
              href="/find-agents"
              className="inline-flex items-center rounded-md bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Find an Agent <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl border border-white/10 bg-navy p-8 text-white shadow-card">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-display text-3xl font-bold">National</p>
                <p className="text-xs text-white/55">Coverage footprint</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">Verified</p>
                <p className="text-xs text-white/55">Directory standards</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">Brokered</p>
                <p className="text-xs text-white/55">Buyer introductions</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold">Buyer-First</p>
                <p className="text-xs text-white/55">Platform workflow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Our Principles</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Three Pillars</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-lg border border-border bg-card p-6 text-center shadow-card">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                  <pillar.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">The Team</p>
            <h2 className="font-display text-3xl font-bold text-navy md:text-4xl">Who Runs BuyerHQ</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <article key={member.name} className="space-y-3 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-border bg-muted">
                  <span className="font-display text-xl font-bold text-navy">{member.initials}</span>
                </div>
                <h3 className="font-display text-base font-bold text-navy">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{member.role}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
