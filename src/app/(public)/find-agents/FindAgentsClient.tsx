"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  HelpCircle,
  LayoutGrid,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { DirectAgentCard } from "@/components/DirectAgentCard";
import { DirectCompareBar } from "@/components/DirectCompareBar";
import type { AgentRow } from "@/lib/database.types";
import { toPublicAgentView, type PublicAgentView } from "@/lib/public-agent";

type LocationSuggestion = {
  suburb: string;
  state: string;
  postcode: string;
};

type AgentsResponse = {
  agents?: AgentRow[];
  total?: number;
  warning?: string;
  error?: string;
};

type SortValue = "rank" | "rating" | "experience" | "reviews" | "az";

function mapSort(sortBy: SortValue) {
  if (sortBy === "rating") return "rating_desc";
  if (sortBy === "experience") return "experience_desc";
  if (sortBy === "reviews") return "reviews_desc";
  if (sortBy === "az") return "name_asc";
  return "authority_desc";
}

export default function FindAgentsClient() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortValue>("rank");
  const [minRating, setMinRating] = useState(0);
  const [minExp, setMinExp] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [blindMode, setBlindMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAgents, setAllAgents] = useState<PublicAgentView[]>([]);

  useEffect(() => {
    let cancelled = false;
    const query = locationInput.trim();
    if (!query || selectedLocation?.suburb === query) {
      setLocationSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "10" });
        if (stateFilter !== "all") params.set("state", stateFilter);
        const response = await fetch(`/api/suburbs?${params.toString()}`);
        const data = (await response.json()) as { suggestions?: LocationSuggestion[] };
        if (!cancelled) setLocationSuggestions(data.suggestions ?? []);
      } catch {
        if (!cancelled) setLocationSuggestions([]);
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [locationInput, selectedLocation, stateFilter]);

  useEffect(() => {
    let cancelled = false;
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sort: mapSort(sortBy),
        limit: "100",
        page: "1",
      });
      if (verifiedOnly) params.set("verified", "true");
      if (stateFilter !== "all") params.set("state", stateFilter);
      if (minRating > 0) params.set("minRating", String(minRating));
      if (minExp > 0) params.set("minExperience", String(minExp));
      if (search.trim()) params.set("search", search.trim());
      if (selectedSpec !== "all") params.set("specialization", selectedSpec);
      if (selectedLocation?.suburb) params.set("suburb", selectedLocation.suburb);
      if (selectedLocation?.postcode) params.set("postcode", selectedLocation.postcode);
      if (!selectedLocation && locationInput.trim()) params.set("location", locationInput.trim());

      try {
        const response = await fetch(`/api/agents?${params.toString()}`, { cache: "no-store" });
        const data = (await response.json()) as AgentsResponse;
        if (!response.ok) throw new Error(data.error ?? "Unable to load agents");
        if (cancelled) return;
        setWarning(data.warning ?? null);
        setAllAgents((data.agents ?? []).map(toPublicAgentView));
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load agents");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchAgents();
    return () => {
      cancelled = true;
    };
  }, [locationInput, minExp, minRating, search, selectedLocation, selectedSpec, sortBy, stateFilter, verifiedOnly]);

  const specialists = useMemo(() => {
    const values = new Set<string>();
    allAgents.forEach((agent) => {
      agent.specialisations.forEach((value) => values.add(value));
    });
    return Array.from(values).sort();
  }, [allAgents]);

  const stateOptions = useMemo(() => {
    const values = new Set<string>();
    allAgents.forEach((agent) => {
      if (agent.state) values.add(agent.state);
    });
    return Array.from(values).sort();
  }, [allAgents]);

  const activeChips: Array<{ label: string; onRemove: () => void }> = [];
  if (stateFilter !== "all") activeChips.push({ label: `State: ${stateFilter}`, onRemove: () => setStateFilter("all") });
  if (search.trim()) activeChips.push({ label: `Search: "${search.trim()}"`, onRemove: () => setSearch("") });
  if (verifiedOnly) activeChips.push({ label: "Verified only", onRemove: () => setVerifiedOnly(false) });
  if (minRating > 0) activeChips.push({ label: `${minRating}+ rating`, onRemove: () => setMinRating(0) });
  if (minExp > 0) activeChips.push({ label: `${minExp}+ yrs`, onRemove: () => setMinExp(0) });
  if (selectedSpec !== "all") activeChips.push({ label: selectedSpec, onRemove: () => setSelectedSpec("all") });
  if (selectedLocation) {
    activeChips.push({
      label: `${selectedLocation.suburb} ${selectedLocation.postcode}`,
      onRemove: () => {
        setSelectedLocation(null);
        setLocationInput("");
      },
    });
  }

  const hasFilters = activeChips.length > 0;

  const compareAgents = allAgents.filter((agent) => compareIds.includes(agent.id));

  const clearFilters = () => {
    setStateFilter("all");
    setSearch("");
    setMinRating(0);
    setMinExp(0);
    setSelectedSpec("all");
    setVerifiedOnly(true);
    setSelectedLocation(null);
    setLocationInput("");
  };

  const SidebarContent = (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Suburb or Postcode</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="e.g. Mosman, 2088..."
            value={locationInput}
            onChange={(event) => {
              setLocationInput(event.target.value);
              setSelectedLocation(null);
            }}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {loadingSuggestions ? <p className="mt-1 text-xs text-muted-foreground">Loading suggestions...</p> : null}
        {locationSuggestions.length > 0 ? (
          <div className="mt-2 max-h-40 overflow-auto rounded-md border border-border bg-card">
            {locationSuggestions.map((suggestion) => (
              <button
                key={`${suggestion.suburb}-${suggestion.state}-${suggestion.postcode}`}
                onClick={() => {
                  setSelectedLocation(suggestion);
                  setLocationInput(`${suggestion.suburb} ${suggestion.postcode}`);
                  setLocationSuggestions([]);
                }}
                className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-xs text-foreground last:border-b-0 hover:bg-muted/40"
              >
                <span>
                  {suggestion.suburb}, {suggestion.state}
                </span>
                <span className="text-muted-foreground">{suggestion.postcode}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">State / Territory</label>
        <select
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All States</option>
          {stateOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground">Verified Only</label>
        <button
          onClick={() => setVerifiedOnly((prev) => !prev)}
          className={cn(
            "relative h-6 w-11 rounded-full transition-colors",
            verifiedOnly ? "bg-navy" : "bg-muted border border-border"
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
              verifiedOnly ? "left-6" : "left-1"
            )}
          />
        </button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Minimum rating</label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={minRating}
          onChange={(event) => setMinRating(Number(event.target.value))}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">{minRating > 0 ? `${minRating}+` : "Any rating"}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Minimum experience</label>
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={minExp}
          onChange={(event) => setMinExp(Number(event.target.value))}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">{minExp > 0 ? `${minExp}+ years` : "Any experience"}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-foreground">Specialist</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpec("all")}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition-all",
              selectedSpec === "all" ? "border-navy bg-navy text-white" : "border-border bg-muted text-muted-foreground"
            )}
          >
            All
          </button>
          {specialists.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpec(spec)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-all",
                selectedSpec === spec ? "border-navy bg-navy text-white" : "border-border bg-muted text-muted-foreground"
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {hasFilters ? (
        <button
          onClick={clearFilters}
          className="w-full rounded-md border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5"
        >
          <X className="mr-1 inline h-3.5 w-3.5" />
          Clear All Filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="bg-background">
      <div className="bg-navy px-4 py-14" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, hsl(220 10% 16%) 0%, hsl(220 10% 8%) 100%)" }}>
        <div className="container mx-auto text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/50">Agent Directory</p>
          <h1 className="font-display text-4xl font-bold text-white">Find a Buyer&apos;s Agent</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Browse verified buyer&apos;s agents across Australia. Filter by location, specialty and ranking.
          </p>
        </div>
      </div>

      <div className="container mx-auto flex gap-6 px-4 py-8">
        <aside className="hidden w-72 flex-shrink-0 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] space-y-5 overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-navy">Filters</h2>
              {hasFilters ? (
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {activeChips.length} active
                </span>
              ) : null}
            </div>
            {SidebarContent}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-foreground lg:hidden"
              >
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                Filters
                {hasFilters ? <span className="ml-1 rounded-full bg-navy px-1.5 py-0.5 text-xs text-white">{activeChips.length}</span> : null}
              </button>
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{allAgents.length}</strong> agents found
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setBlindMode((prev) => !prev);
                  setRevealed(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  blindMode ? "border-foreground bg-foreground text-background" : "border-border bg-muted text-muted-foreground"
                )}
              >
                {blindMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {blindMode ? "Blind Mode ON" : "Blind Mode"}
              </button>

              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortValue)}
                  className="h-8 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="rank">Top Ranked</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experience</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="az">A-Z</option>
                </select>
                <span title="Ranking uses authority score, reviews, experience and verification signals">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </div>

              <div className="overflow-hidden rounded-md border border-border">
                <button
                  onClick={() => setView("grid")}
                  className={cn("p-1.5 transition-colors", view === "grid" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn("p-1.5 transition-colors", view === "list" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {activeChips.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs text-white">
                  {chip.label}
                  <button onClick={chip.onRemove}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-navy">
                Clear all
              </button>
            </div>
          ) : null}

          {warning ? (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {warning}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {blindMode && !revealed ? (
            <div className="mb-4 flex items-center justify-between gap-4 rounded-lg bg-foreground px-5 py-4 text-background">
              <div>
                <p className="font-display text-sm font-bold">Blind Mode active</p>
                <p className="text-xs opacity-70">Agent names and photos are hidden. Choose by stats, then reveal identities.</p>
              </div>
              <button
                onClick={() => setRevealed(true)}
                className="rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
              >
                <Eye className="mr-1 inline h-3.5 w-3.5" />
                Reveal Agents
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-lg border border-border bg-muted/40" />
              ))}
            </div>
          ) : allAgents.length > 0 ? (
            <div className={view === "grid" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
              {allAgents.map((agent) => (
                <DirectAgentCard
                  key={agent.id}
                  agent={agent}
                  view={view}
                  compareIds={compareIds}
                  onCompareToggle={(id) =>
                    setCompareIds((current) =>
                      current.includes(id)
                        ? current.filter((item) => item !== id)
                        : current.length < 3
                          ? [...current, id]
                          : current
                    )
                  }
                  blindMode={blindMode && !revealed}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card py-20 text-center text-muted-foreground">
              <Search className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-lg font-semibold text-foreground">No agents match your filters</p>
              <p className="mt-1 text-sm">Try broadening your search by removing a filter or two.</p>
              <button
                onClick={clearFilters}
                className="mt-5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Reset all filters
              </button>
            </div>
          )}

          {allAgents.length > 0 ? (
            <section className="mt-14">
              <h2 className="mb-4 font-display text-lg font-bold text-navy">Explore by suburb</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(allAgents.flatMap((agent) => agent.suburbsCovered))).slice(0, 20).map((suburb) => (
                  <Link
                    key={suburb}
                    href={`/suburb/${suburb.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-1 rounded-full border border-border bg-muted px-3 py-1.5 text-sm transition-all hover:border-navy hover:bg-navy hover:text-white"
                  >
                    <MapPin className="h-3 w-3" />
                    {suburb}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 right-0 top-0 w-80 overflow-y-auto border-l border-border bg-card p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-navy">Filters</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {SidebarContent}
            <button
              className="mt-6 w-full rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setSidebarOpen(false)}
            >
              Show {allAgents.length} Results
            </button>
          </div>
        </div>
      ) : null}

      {compareIds.length > 0 ? (
        <>
          <DirectCompareBar
            agents={compareAgents}
            onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
            onClose={() => setCompareIds([])}
          />
          <div className="h-16" />
        </>
      ) : null}
    </div>
  );
}
