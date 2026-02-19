import type { Metadata } from "next";
import Link from "next/link";

import { AgentCard } from "@/components/AgentCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  getFeaturedAgents,
  getHomepageStats,
  getPublishedBlogPosts,
  getStateAgentCounts,
} from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Home | BuyerHQ",
  description:
    "Find verified buyer's agents across Australia. Compare specialties, pricing, and reviews in one place.",
};

const stateNameMap: Record<string, string> = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory",
};

const faqs = [
  {
    q: "What does a Buyer's Agent do?",
    a: "A buyer's agent represents you, not the seller. They source properties, assess value, negotiate terms, and can bid at auction on your behalf. Many also provide access to off-market opportunities through their local networks.",
  },
  {
    q: "Is BuyerHQ free for buyers?",
    a: "Yes. BuyerHQ is free for property buyers. Agents pay to list and maintain their profile, while buyer access to search, compare, and enquire remains free.",
  },
  {
    q: "How are agents verified?",
    a: "We verify licences and profile information before an agent is marked as verified. We also moderate reviews and remove profiles that no longer meet our listing standards.",
  },
];

export default async function HomePage() {
  const [stats, featuredAgents, stateCounts, posts] = await Promise.all([
    getHomepageStats(),
    getFeaturedAgents(),
    getStateAgentCounts(),
    getPublishedBlogPosts(),
  ]);

  return (
    <div className="space-y-14 pb-16 pt-10">
      <section className="container">
        <div className="rounded-xl border border-border bg-surface p-8 md:p-12">
          <p className="font-mono text-label uppercase text-text-secondary">
            Australia&apos;s verified buyer&apos;s agent directory
          </p>
          <h1 className="mt-3 text-display-lg text-text-primary md:text-display-xl">
            Find trusted buyer representation in minutes.
          </h1>
          <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">
            Compare verified advisors by location, specialisation, and proven outcomes through a
            client-focused, brokered platform.
          </p>
          <ul className="mt-4 grid gap-2 text-body-sm text-text-secondary">
            <li>• Client focused: buyers compare clearly and submit requests through BuyerHQ.</li>
            <li>• BuyerHQ brokers conversations and operational details as middleman.</li>
            <li>• No direct buyer-agent contact flow. Everything is tracked internally.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/agents">Find an Agent</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/quiz">Take the Match Quiz</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/signup">Buyer Sign Up</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login">Buyer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Verified Agents" value={stats.verifiedAgents} />
        <StatCard label="States Covered" value={stats.statesCovered} />
        <StatCard label="Enquiries This Month" value={stats.enquiriesMtd} />
        <StatCard label="Avg Response Time" value={stats.avgResponseTime} />
      </section>

      <section className="container">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading">How it works</h2>
            <p className="text-body-sm text-text-secondary">Simple process. Real data. No noise.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            {
              title: "1. Define your brief",
              text: "Tell us your state, budget range, and preferred buying strategy.",
            },
            {
              title: "2. Compare specialists",
              text: "Review verified profiles, fees, and approved buyer feedback.",
            },
            {
              title: "3. Enquire with confidence",
              text: "Submit a brokered enquiry and let BuyerHQ coordinate next steps with your shortlisted agent.",
            },
          ].map((step) => (
            <Card key={step.title} className="p-4">
              <h3 className="text-subheading text-text-primary">{step.title}</h3>
              <p className="mt-2 text-body-sm text-text-secondary">{step.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading">Featured Agents</h2>
            <p className="text-body-sm text-text-secondary">
              Top rated, verified, and currently active.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/agents">Browse All Agents</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      <section className="container">
        <div className="mb-5">
          <h2 className="text-heading">State Directory</h2>
          <p className="text-body-sm text-text-secondary">
            Browse coverage by state and territory.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stateNameMap).map(([stateCode, stateName]) => (
            <Link
              key={stateCode}
              href={`/agents?state=${stateCode}`}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-light"
            >
              <div className="font-mono text-label uppercase text-text-secondary">{stateCode}</div>
              <h3 className="mt-1 text-subheading text-text-primary">{stateName}</h3>
              <p className="mt-2 text-body-sm text-text-secondary">
                {stateCounts[stateCode] ?? 0} verified agents
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-heading">Insights</h2>
            <p className="text-body-sm text-text-secondary">
              Latest published market and buying strategy content.
            </p>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/blog">View Blog</Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-light"
            >
              <p className="font-mono text-caption uppercase text-text-secondary">{post.category}</p>
              <h3 className="mt-2 text-subheading text-text-primary">{post.title}</h3>
              <p className="mt-2 text-body-sm text-text-secondary">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-heading">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-3 space-y-2">
              {faqs.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="rounded-md border border-border px-3">
                  <AccordionTrigger className="text-body text-text-primary hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-body-sm text-text-secondary">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="p-5">
            <h2 className="text-heading">Ready to shortlist your agent?</h2>
            <p className="mt-2 text-body text-text-secondary">
              Filter by state and specialisation, then submit brokered enquiries while BuyerHQ manages outreach.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/agents">Browse Agents</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/signup">Create Buyer Account</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
