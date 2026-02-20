import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export function CTABanner() {
  return (
    <section className="bg-navy px-4 py-16">
      <div className="container mx-auto space-y-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className="h-4 w-4 fill-white/30 text-white/30" />
          ))}
          <span className="ml-2 text-sm text-white/50">Rated highly by verified buyers</span>
        </div>
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white md:text-4xl">
          Ready to find your perfect buyer&apos;s agent?
        </h2>
        <p className="mx-auto max-w-xl text-lg text-white/55">
          Compare verified specialists, shortlist with confidence, and let BuyerHQ broker the introduction.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/find-agents"
            className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 font-semibold text-navy transition-colors hover:bg-white/90"
          >
            Find an Agent <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/match-quiz"
            className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10"
          >
            Take the Match Quiz
          </Link>
        </div>
      </div>
    </section>
  );
}
