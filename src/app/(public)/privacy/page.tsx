import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | BuyerHQ",
  description:
    "Read how BuyerHQ handles personal data, usage information, and buyer privacy rights.",
};

const sections = [
  {
    title: "1. Introduction",
    body: "BuyerHQ (\"we\", \"us\", \"our\") respects your privacy and is committed to protecting your personal data. This policy explains what we collect, why we collect it, and how we handle it when you use BuyerHQ.",
  },
  {
    title: "2. Data We Collect",
    body: "Depending on your usage, BuyerHQ may collect identity data, contact data, technical usage data, and information you submit through forms and enquiries.",
    points: [
      "Identity data (for example, name and account profile details).",
      "Contact data (for example, email address and phone number).",
      "Technical data (for example, IP address, browser version, and device metadata).",
      "Usage data (for example, how you browse and interact with BuyerHQ).",
    ],
  },
  {
    title: "3. How We Use Your Data",
    body: "We process personal data only where lawful and relevant to delivering BuyerHQ services.",
    points: [
      "To support buyer-to-agent matching and brokered introductions.",
      "To respond to enquiries and service requests.",
      "To improve platform quality, reliability, and user experience.",
      "To maintain security, moderation, and compliance controls.",
    ],
  },
  {
    title: "4. Data Security",
    body: "BuyerHQ applies technical and operational controls to reduce unauthorized access, misuse, and disclosure risk. Access to personal data is limited to authorised roles with legitimate business need.",
  },
  {
    title: "5. Your Rights",
    body: "Subject to applicable law, you may request access, correction, deletion, restriction, or objection in relation to personal data processed by BuyerHQ.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-16"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Legal</p>
          <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Privacy Policy</h1>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-white/45">Last updated: February 2026</p>
        </div>
      </div>

      <section className="container mx-auto max-w-4xl space-y-4 px-4 py-10">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <h2 className="font-display text-xl font-bold text-navy">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
            {section.points ? (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <article className="rounded-lg border border-border bg-muted/30 p-6">
          <h2 className="font-display text-xl font-bold text-navy">Contact &amp; Privacy Requests</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If you have questions about this policy or want to make a privacy request, contact{" "}
            <a href="mailto:privacy@buyerhq.com.au" className="font-semibold text-foreground underline underline-offset-2">
              privacy@buyerhq.com.au
            </a>
            .
          </p>
          <div className="mt-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-navy hover:text-navy"
            >
              Contact BuyerHQ
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
