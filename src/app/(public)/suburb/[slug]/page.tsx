import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

import { DirectAgentCard } from "@/components/DirectAgentCard";
import { agentIsActive, agentIsVerified, agentSuburbs, normalizeAgents } from "@/lib/agent-compat";
import type { AgentRow, StateCode } from "@/lib/database.types";
import { toPublicAgentViews } from "@/lib/public-agent";
import { createClient } from "@/lib/supabase/server";

type Params = { slug: string };

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseSuburbSlug(slug: string) {
  const parts = slug.toLowerCase().split("-").filter(Boolean);
  if (parts.length === 0) return { suburb: "", state: null as StateCode | null };

  const maybeState = parts.at(-1)?.toUpperCase() as StateCode | undefined;
  if (maybeState && stateCodes.includes(maybeState)) {
    return {
      suburb: toTitleCase(parts.slice(0, -1).join(" ")),
      state: maybeState,
    };
  }

  return {
    suburb: toTitleCase(parts.join(" ")),
    state: null as StateCode | null,
  };
}

function normalizeToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function getSuburbData(slug: string) {
  const parsed = parseSuburbSlug(slug);
  const suburbNeedle = normalizeToken(parsed.suburb);

  const supabase = createClient();
  const { data } = await supabase.from("agents").select("*");
  const visibleAgents = normalizeAgents((data ?? []) as AgentRow[]).filter(
    (agent) => agentIsActive(agent) && agentIsVerified(agent)
  );

  const matchingAgents = visibleAgents.filter((agent) => {
    if (parsed.state && agent.state !== parsed.state) return false;
    const suburbs = agentSuburbs(agent).map(normalizeToken);
    return suburbs.some(
      (suburb) =>
        suburb === suburbNeedle || suburb.includes(suburbNeedle) || suburbNeedle.includes(suburb)
    );
  });

  const relatedSuburbs = Array.from(
    new Set(
      matchingAgents
        .flatMap((agent) => agentSuburbs(agent))
        .map((suburb) => suburb.trim())
        .filter(Boolean)
    )
  )
    .sort()
    .slice(0, 16)
    .map((suburb) => {
      const state = matchingAgents.find((agent) => agentSuburbs(agent).includes(suburb))?.state ?? "NSW";
      return {
        name: suburb,
        slug: `${suburb
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")}-${state.toLowerCase()}`,
      };
    });

  return {
    parsed,
    agents: toPublicAgentViews(matchingAgents),
    relatedSuburbs,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const parsed = parseSuburbSlug(params.slug);
  if (!parsed.suburb) {
    return {
      title: "Suburb Coverage | BuyerHQ",
      description: "Find verified buyer's agents by suburb.",
    };
  }

  return {
    title: `${parsed.suburb}${parsed.state ? `, ${parsed.state}` : ""} | BuyerHQ`,
    description: `Browse verified buyer's agents covering ${parsed.suburb}${
      parsed.state ? `, ${parsed.state}` : ""
    }.`,
  };
}

export default async function SuburbPage({ params }: { params: Params }) {
  const { parsed, agents, relatedSuburbs } = await getSuburbData(params.slug);
  const pageTitle = parsed.suburb ? `${parsed.suburb}${parsed.state ? `, ${parsed.state}` : ""}` : "Suburb Coverage";

  return (
    <div className="bg-background">
      <div
        className="bg-navy px-4 py-12"
        style={{ backgroundImage: "radial-gradient(circle at 70% 40%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto">
          <Link
            href="/suburbs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Suburb Directory
          </Link>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Suburb Profile</p>
          <h1 className="font-display text-4xl font-bold text-white">Buyer&apos;s Agents in {pageTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm text-white/60">
            Live coverage powered by verified BuyerHQ profiles and suburb service areas.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-navy">
            {agents.length} agent{agents.length === 1 ? "" : "s"} covering {pageTitle}
          </h2>
          <Link
            href={`/find-agents?search=${encodeURIComponent(parsed.suburb)}`}
            className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
          >
            Open full directory <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>

        {agents.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => (
              <DirectAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card py-16 text-center shadow-card">
            <p className="text-base font-semibold text-foreground">No verified agents listed for this suburb yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try nearby suburbs or run a broader search by state.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/suburbs"
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
              >
                Browse all suburbs
              </Link>
              <Link
                href="/match-quiz"
                className="inline-flex items-center rounded-md bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-mid"
              >
                Take match quiz
              </Link>
            </div>
          </div>
        )}

        {relatedSuburbs.length > 0 ? (
          <section className="mt-12">
            <h3 className="mb-3 font-display text-lg font-bold text-navy">Nearby covered suburbs</h3>
            <div className="flex flex-wrap gap-2">
              {relatedSuburbs.map((suburb) => (
                <Link
                  key={suburb.slug}
                  href={`/suburb/${suburb.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-navy hover:text-navy"
                >
                  <MapPin className="h-3 w-3" />
                  {suburb.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
