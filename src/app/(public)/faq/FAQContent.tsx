"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CTABanner } from "@/components/CTABanner";

const faqCategories = [
  {
    category: "About Buyer's Agents",
    items: [
      {
        q: "What is a buyer's agent?",
        a: "A buyer's agent represents the purchaser and helps with search strategy, due diligence, negotiation, and buying execution.",
      },
      {
        q: "Why engage a buyer's agent instead of doing it yourself?",
        a: "In fast markets, specialist support can reduce decision errors, improve negotiation outcomes, and save time.",
      },
      {
        q: "How much do buyer's agents usually charge?",
        a: "Fee models vary by service scope. BuyerHQ profiles surface fee context so buyers can compare options efficiently.",
      },
      {
        q: "Can buyer's agents support auction bidding?",
        a: "Yes. Many specialists provide auction strategy and bidding support as part of their service.",
      },
    ],
  },
  {
    category: "BuyerHQ Platform",
    items: [
      {
        q: "Is BuyerHQ free for buyers?",
        a: "Yes. Searching, comparing, and submitting enquiries on BuyerHQ is free for buyers.",
      },
      {
        q: "How does verification work?",
        a: "Profiles pass through a verification and moderation workflow before trust signals are shown publicly.",
      },
      {
        q: "Can I compare multiple agents?",
        a: "Yes. The directory supports shortlist and comparison workflows to help buyers evaluate fit quickly.",
      },
      {
        q: "Does BuyerHQ broker introductions?",
        a: "Yes. BuyerHQ coordinates introduction flow for enquiries submitted through the platform.",
      },
    ],
  },
  {
    category: "Getting Started",
    items: [
      {
        q: "What's the fastest way to get matched?",
        a: "Start with the Match Quiz, then refine with directory filters for state, suburb, and service focus.",
      },
      {
        q: "Can I search by suburb or postcode?",
        a: "Yes. Use the directory search and suburb tools to narrow to local coverage.",
      },
      {
        q: "What should I prepare before sending enquiries?",
        a: "Prepare your target location, budget range, timeline, and any must-have criteria.",
      },
    ],
  },
];

export default function FAQContent() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            !needle ||
            item.q.toLowerCase().includes(needle) ||
            item.a.toLowerCase().includes(needle)
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [search]);

  const totalQuestions = faqCategories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Answers</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
            {totalQuestions} common questions answered for buyers using BuyerHQ.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search FAQs..."
                className="w-full rounded-md border border-white/20 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </label>
          </div>
        </div>
      </div>

      <section className="container mx-auto max-w-3xl space-y-10 px-4 py-12">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-border bg-card py-12 text-center">
            <p className="text-sm font-semibold text-foreground">No questions matched your search.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try broader keywords or clear the search field.</p>
          </div>
        ) : (
          filtered.map((category) => (
            <div key={category.category}>
              <h2 className="mb-3 border-b border-border pb-2 font-display text-lg font-bold text-navy">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.items.map((item, index) => (
                  <AccordionItem
                    key={`${category.category}-${index}`}
                    value={`${category.category}-${index}`}
                    className="rounded-lg border border-border bg-card px-4 shadow-sm"
                  >
                    <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        )}
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-display text-xl font-bold text-navy">Still need help?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact BuyerHQ and we&apos;ll help you progress your shortlist.
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </div>
  );
}
