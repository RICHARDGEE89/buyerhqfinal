import type { Metadata } from "next";
import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ | BuyerHQ",
  description: "Frequently asked questions about BuyerHQ and buyer's agent engagement.",
};

const faqs = [
  {
    q: "1. What does a Buyer's Agent do?",
    a: "A buyer's agent represents the purchaser only. They help you define buying criteria, source both on-market and off-market opportunities, assess fair value, negotiate terms and price, and can bid at auction on your behalf. Their role is to advocate for your interests from strategy through settlement.",
  },
  {
    q: "2. Why use one instead of DIY?",
    a: "A professional buyer's agent brings suburb-level expertise, deeper stock access, and disciplined negotiation. Most buyers simply do not have the time to inspect every listing, triage risk, and negotiate effectively while the market is moving. The right advisor can compress timelines and reduce expensive decision errors.",
  },
  {
    q: "3. Is BuyerHQ free for buyers?",
    a: "Yes. BuyerHQ is always free for buyers. Agents pay to list and maintain their profile. Buyer access to search, compare, and enquire is free.",
  },
  {
    q: "4. How much do Buyer's Agents charge?",
    a: "Fee models vary by service scope. Many charge a fixed engagement fee (commonly from around $8,000 to $20,000), while some charge a percentage of purchase price. You should always confirm inclusions, exclusions, and milestone payments before engaging.",
  },
  {
    q: "5. How do you verify agents?",
    a: "BuyerHQ manually verifies each profile using licence records and supporting business details. We reference state-level licensing information, review profile completeness and history, and only mark a profile as verified once checks are complete.",
  },
  {
    q: "6. Do you take commission?",
    a: "No. BuyerHQ does not take property transaction commissions. The platform operates as an independent directory and does not participate in sales commissions.",
  },
  {
    q: "7. Is BuyerHQ a real estate agency?",
    a: "No. BuyerHQ is not a selling agency. It is a directory and discovery platform connecting buyers to verified buyer-side professionals.",
  },
  {
    q: "8. Can I use BuyerHQ for investment properties?",
    a: "Yes. Many listed professionals specialise in investment strategy. In the directory, select specialisations such as 'Investment Strategy' to narrow your shortlist.",
  },
  {
    q: "9. How do I list my business?",
    a: "Use the 'Create Agent Profile' link in the header. Complete onboarding with your licence and profile details. Profiles can also be uploaded directly by BuyerHQ admin. Every listing is reviewed before verification.",
  },
  {
    q: "10. Can't find an agent in my suburb?",
    a: "Coverage is expanding continuously. Start by filtering your state and adjacent growth corridors, then contact us and we can prioritise verification efforts for your target suburb.",
  },
];

export default function FAQPage() {
  return (
    <div className="container space-y-8 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">Frequently asked questions</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">
          Answers to common questions about using BuyerHQ and working with buyer&apos;s agents.
        </p>
      </section>

      <Card className="p-4 md:p-5">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`} className="rounded-md border border-border px-3">
              <AccordionTrigger className="text-left text-body text-text-primary hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-body-sm text-text-secondary">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Card className="p-6">
        <h2 className="text-subheading text-text-primary">Still need help?</h2>
        <p className="mt-2 text-body-sm text-text-secondary">
          Contact the BuyerHQ team and we&apos;ll reply within one business day.
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
