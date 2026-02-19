import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "How It Works | BuyerHQ",
  description:
    "Understand the BuyerHQ process for discovering, comparing, and sending brokered enquiries to verified buyer's agents.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Step 1 — Define your criteria",
      text: "Share your budget, target state, preferred suburbs, and buying goals so your shortlist starts with the right fit.",
    },
    {
      title: "Step 2 — Compare verified specialists",
      text: "Review agent profiles with transparent fee structures, approved reviews, and domain-specific specialisations.",
    },
    {
      title: "Step 3 — Enquire and engage",
      text: "Submit a brokered enquiry. BuyerHQ coordinates introductions and next-step details with the selected agent.",
    },
  ];

  return (
    <div className="container space-y-10 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">How BuyerHQ works</h1>
        <p className="mt-4 max-w-3xl text-body-lg text-text-secondary">
          BuyerHQ is built for buyers who want clear information and fast comparisons without
          marketplace noise.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <Card key={step.title} className="p-5">
            <h2 className="text-subheading text-text-primary">{step.title}</h2>
            <p className="mt-2 text-body-sm text-text-secondary">{step.text}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-3 rounded-xl border border-border bg-surface p-6 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-heading">Start when you&apos;re ready</h2>
          <p className="mt-2 text-body text-text-secondary">
            Browse the full directory now or answer a few questions in the match quiz first.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button asChild>
            <Link href="/agents">Start Your Search</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/quiz">Take the Quiz</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/signup">Buyer Sign Up</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/login">Buyer Login</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
