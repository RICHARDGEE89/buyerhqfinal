import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About | BuyerHQ",
  description:
    "Learn why BuyerHQ exists, how verification works, and the principles behind our buyer-first platform.",
};

export default function AboutPage() {
  return (
    <div className="container space-y-8 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">About BuyerHQ</h1>
        <p className="mt-3 max-w-3xl text-body-lg text-text-secondary">
          BuyerHQ exists to make buyer representation easier to discover, compare, and trust across
          Australia.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-heading">Our mission</h2>
          <p className="mt-2 text-body text-text-secondary">
            We help property buyers find qualified buyer-side professionals without referral noise,
            opaque rankings, or seller-first bias.
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="text-heading">Why we built BuyerHQ</h2>
          <p className="mt-2 text-body text-text-secondary">
            Buyers often make high-stakes decisions with fragmented information. BuyerHQ was built as
            an independent index focused on buyer outcomes, not listing volume.
          </p>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Card className="p-5">
          <h3 className="text-subheading">Verification</h3>
          <p className="mt-2 text-body-sm text-text-secondary">
            Profiles are reviewed before a verified badge is applied.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="text-subheading">Transparency</h3>
          <p className="mt-2 text-body-sm text-text-secondary">
            Fees, suburbs, and specialisations are visible so buyers can shortlist faster.
          </p>
        </Card>
        <Card className="p-5">
          <h3 className="text-subheading">Independence</h3>
          <p className="mt-2 text-body-sm text-text-secondary">
            BuyerHQ is a marketplace directory, not a selling agency.
          </p>
        </Card>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-heading">Find your shortlist now</h2>
        <p className="mt-2 text-body-sm text-text-secondary">
          Start with the directory or use the quiz to narrow by state and specialisation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/agents">Find an Agent</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/quiz">Take the Quiz</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
