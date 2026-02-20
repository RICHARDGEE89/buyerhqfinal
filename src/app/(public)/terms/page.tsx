import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | BuyerHQ",
  description: "Read the terms governing access and usage of the BuyerHQ platform.",
};

const sections = [
  {
    title: "1. Agreement to Terms",
    body: "These Terms of Service form a legal agreement between you and BuyerHQ regarding your access to and use of the BuyerHQ platform and related services.",
  },
  {
    title: "2. Directory & Platform Role",
    body: "BuyerHQ operates as a directory and introduction platform for buyer-side professionals. BuyerHQ is not a real estate agency and does not provide legal, financial, or personal property advice.",
  },
  {
    title: "3. User Responsibilities",
    body: "By using BuyerHQ, you represent that information you submit is accurate and current, and that you will use the platform lawfully and in accordance with these terms.",
  },
  {
    title: "4. Limitation of Liability",
    body: "To the extent permitted by law, BuyerHQ is not liable for indirect or consequential losses arising from platform use, including loss of revenue, opportunity, or data.",
  },
  {
    title: "5. Governing Law",
    body: "These terms are governed by Australian law. Relevant courts in Australia have jurisdiction over disputes arising from these terms or platform usage.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Terms of Service</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/45">Last updated: February 2026</p>
        </div>
      </div>

      <section className="container mx-auto max-w-4xl space-y-4 px-4 py-10">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-navy">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
          </article>
        ))}

        <article className="rounded-lg border border-border bg-muted/30 p-6">
          <h2 className="font-display text-xl font-bold text-navy">Questions About These Terms</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If you need clarification on these terms, contact BuyerHQ support before using features that depend on
            account registration or enquiry submission.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
            >
              Contact Support
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
            >
              View Privacy Policy
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
