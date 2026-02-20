import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";

import { agentIsActive, agentIsVerified, agentSuburbs, normalizeAgents } from "@/lib/agent-compat";
import type { AgentRow, StateCode } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Suburb Directory | BuyerHQ",
  description: "Browse suburb coverage and find verified buyer's agents by location.",
};

const stateCodes: StateCode[] = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

type SuburbDirectoryItem = {
  suburb: string;
  state: string;
  slug: string;
  agentCount: number;
};

function slugifySuburb(suburb: string, state: string) {
  return `${suburb
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")}-${state.toLowerCase()}`;
}

async function getSuburbDirectory() {
  const supabase = createClient();
  const { data } = await supabase.from("agents").select("*");
  const visibleAgents = normalizeAgents((data ?? []) as AgentRow[]).filter(
    (agent) => agentIsActive(agent) && agentIsVerified(agent)
  );

  const counts = new Map<string, SuburbDirectoryItem>();
  for (const agent of visibleAgents) {
    const state = (agent.state ?? "").toUpperCase();
    if (!state || !stateCodes.includes(state as StateCode)) continue;

    for (const suburbRaw of agentSuburbs(agent)) {
      const suburb = suburbRaw.trim();
      if (!suburb) continue;
      const key = `${suburb.toLowerCase()}|${state}`;
      const existing = counts.get(key);
      if (existing) {
        existing.agentCount += 1;
        continue;
      }
      counts.set(key, {
        suburb,
        state,
        slug: slugifySuburb(suburb, state),
        agentCount: 1,
      });
    }
  }

  return Array.from(counts.values()).sort(
    (a, b) => b.agentCount - a.agentCount || a.state.localeCompare(b.state) || a.suburb.localeCompare(b.suburb)
  );
}

export default async function SuburbsPage({
  searchParams,
}: {
  searchParams?: { q?: string; state?: string };
}) {
  const query = (searchParams?.q ?? "").trim().toLowerCase();
  const stateFilter = (searchParams?.state ?? "").trim().toUpperCase();
  const suburbs = await getSuburbDirectory();

  const filtered = suburbs.filter((item) => {
    if (stateFilter && item.state !== stateFilter) return false;
    if (!query) return true;
    return item.suburb.toLowerCase().includes(query) || item.state.toLowerCase().includes(query);
  });

  return (
    <div className="py-12">
      <div
        className="bg-navy px-4 py-14"
        style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}
      >
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">National Coverage</p>
          <h1 className="font-display text-4xl font-bold text-white">Suburb Directory</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/60">
            Browse live suburb coverage generated from verified BuyerHQ agent profiles.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 shadow-card md:grid-cols-[1fr,180px,auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={searchParams?.q ?? ""}
              placeholder="Search suburb or state"
              className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <select
            name="state"
            defaultValue={stateFilter || ""}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All States</option>
            {stateCodes.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-mid">
            Apply
          </button>
        </form>

        <p className="mb-4 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> suburbs
        </p>

        {filtered.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <Link
                key={`${item.state}-${item.suburb}`}
                href={`/suburb/${item.slug}`}
                className="group rounded-lg border border-border bg-card p-4 shadow-card transition-all hover:border-navy hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-navy group-hover:text-navy-mid">
                      {item.suburb}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.state}</p>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {item.agentCount} agent{item.agentCount === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-navy">
                  <MapPin className="h-3 w-3" />
                  View suburb coverage
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card py-16 text-center">
            <p className="text-sm font-semibold text-foreground">No suburbs matched your filters.</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a broader suburb name or remove the state filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
