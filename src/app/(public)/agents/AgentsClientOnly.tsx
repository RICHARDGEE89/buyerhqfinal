"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Grid2X2, List } from "lucide-react";

import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AgentCardSkeleton } from "@/components/ui/Skeleton";
import type { AgentRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const specializations = [
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
];

type ViewMode = "grid" | "list";
type SortValue = "rating_desc" | "authority_desc" | "experience_desc" | "reviews_desc" | "newest_desc" | "name_asc";

type LocationSuggestion = {
  suburb: string;
  state: string;
  postcode: string;
};

type LocationHint = {
  suburb: string;
  state: string | null;
  postcode: string | null;
  count: number;
};

type AgentsResponse = {
  agents?: AgentRow[];
  total?: number;
  warning?: string;
  locationHints?: LocationHint[];
};

type SavedSearchSnapshot = {
  createdAt: string;
  query: string;
  label: string;
  filtersApplied: number;
};

export default function AgentsClientOnly() {
  const supabase = useMemo(() => createClient(), []);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [locationHints, setLocationHints] = useState<LocationHint[]>([]);

  const [search, setSearch] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [stateFilter, setStateFilter] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [hasFeeOnly, setHasFeeOnly] = useState(false);
  const [hasReviewsOnly, setHasReviewsOnly] = useState(false);
  const [minRating, setMinRating] = useState("");
  const [minExperience, setMinExperience] = useState("0");
  const [sortBy, setSortBy] = useState<SortValue>("rating_desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [saveSearchLoading, setSaveSearchLoading] = useState(false);
  const [showSaveSearchGate, setShowSaveSearchGate] = useState(false);
  const [saveSearchNotice, setSaveSearchNotice] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 12;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (stateFilter) params.set("state", stateFilter);
    if (verifiedOnly) params.set("verified", "true");
    if (hasFeeOnly) params.set("hasFee", "true");
    if (hasReviewsOnly) params.set("minReviews", "1");
    if (minRating) params.set("minRating", minRating);
    if (minExperience !== "0") params.set("minExperience", minExperience);
    params.set("sort", sortBy);
    if (search.trim()) params.set("search", search.trim());
    if (selectedLocation?.suburb) params.set("suburb", selectedLocation.suburb);
    if (selectedLocation?.postcode) params.set("postcode", selectedLocation.postcode);
    if (!selectedLocation && locationInput.trim()) params.set("location", locationInput.trim());
    if (selectedSpecializations.length) {
      params.set("specializations", selectedSpecializations.join(","));
    }
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }, [
    hasFeeOnly,
    hasReviewsOnly,
    limit,
    locationInput,
    minExperience,
    minRating,
    page,
    search,
    selectedLocation,
    selectedSpecializations,
    sortBy,
    stateFilter,
    verifiedOnly,
  ]);

  useEffect(() => {
    let cancelled = false;

    const fetchAgents = async () => {
      try {
        if (page === 1) setLoading(true);
        setError(null);

        const response = await fetch(`/api/agents?${queryString}`, { cache: "no-store" });
        const data = (await response.json()) as AgentsResponse & { error?: string };
        if (!response.ok) throw new Error(data.error ?? "Unable to fetch agents");

        if (cancelled) return;
        setTotal(data.total ?? 0);
        setWarning(data.warning ?? null);
        setLocationHints(data.locationHints ?? []);
        setAgents((prev) => (page === 1 ? data.agents ?? [] : [...prev, ...(data.agents ?? [])]));
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load agents");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAgents();
    return () => {
      cancelled = true;
    };
  }, [page, queryString]);

  useEffect(() => {
    const query = locationInput.trim();
    const selectedLocationLabel = selectedLocation
      ? `${selectedLocation.suburb} ${selectedLocation.postcode}`.trim().toLowerCase()
      : "";
    if (!query || query.toLowerCase() === selectedLocationLabel) {
      setLocationSuggestions([]);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const params = new URLSearchParams({ q: query, limit: "12" });
        if (stateFilter) params.set("state", stateFilter);
        const response = await fetch(`/api/suburbs?${params.toString()}`);
        const data = (await response.json()) as { suggestions?: LocationSuggestion[] };
        if (!cancelled) {
          setLocationSuggestions(data.suggestions ?? []);
        }
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

  const resetPagination = () => {
    setPage(1);
  };

  const onToggleSpecialization = (specialization: string, checked: boolean) => {
    setSelectedSpecializations((current) =>
      checked ? [...current, specialization] : current.filter((item) => item !== specialization)
    );
    resetPagination();
  };

  const hasMore = agents.length < total;
  const topSuburbs = useMemo(() => locationHints.slice(0, 20), [locationHints]);
  const activeSearchLabel = useMemo(() => {
    if (selectedLocation) {
      return `${selectedLocation.suburb}, ${selectedLocation.state} ${selectedLocation.postcode}`.trim();
    }
    if (locationInput.trim()) {
      return locationInput.trim();
    }
    if (stateFilter) {
      return stateFilter;
    }
    return "Australia-wide";
  }, [locationInput, selectedLocation, stateFilter]);

  const handleSaveSearch = async () => {
    setSaveSearchLoading(true);
    setShowSaveSearchGate(false);
    setSaveSearchNotice(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setShowSaveSearchGate(true);
        return;
      }

      const queryParams = new URLSearchParams(queryString);
      queryParams.delete("page");
      queryParams.delete("limit");
      const query = queryParams.toString();
      const filtersApplied = query ? query.split("&").length : 0;
      const snapshot: SavedSearchSnapshot = {
        createdAt: new Date().toISOString(),
        query,
        label: activeSearchLabel,
        filtersApplied,
      };

      const storageKey = `buyerhq_saved_searches_${user.id}`;
      const currentRaw = window.localStorage.getItem(storageKey);
      const current = currentRaw ? (JSON.parse(currentRaw) as SavedSearchSnapshot[]) : [];
      const deduped = current.filter((item) => item.query !== snapshot.query);
      window.localStorage.setItem(storageKey, JSON.stringify([snapshot, ...deduped].slice(0, 20)));
      setSaveSearchNotice("Search saved. You can revisit it from your buyer workflow.");
    } catch {
      setSaveSearchNotice("Unable to save this search right now.");
    } finally {
      setSaveSearchLoading(false);
    }
  };

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">Find buyer&apos;s agents</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">
          Search a verified directory built from collated review signals and negotiated fee outcomes, then let BuyerHQ
          broker the next step.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[360px,1fr]">
        <aside className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <Input
            label="Search agents"
            placeholder="Name, agency, suburb, strategy"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPagination();
            }}
          />
          <div className="space-y-2">
            <Input
              label="Suburb or postcode"
              placeholder="Type suburb or postcode"
              value={locationInput}
              onChange={(event) => {
                setLocationInput(event.target.value);
                setSelectedLocation(null);
                resetPagination();
              }}
              helperText="Autocomplete supports both postcode and suburb name."
            />
            {selectedLocation ? (
              <div className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
                <span>
                  Selected: {selectedLocation.suburb}, {selectedLocation.state} ({selectedLocation.postcode})
                </span>
                <button
                  type="button"
                  className="text-text-primary underline"
                  onClick={() => {
                    setSelectedLocation(null);
                    setLocationInput("");
                    resetPagination();
                  }}
                >
                  Clear
                </button>
              </div>
            ) : null}
            {loadingSuggestions ? (
              <p className="text-caption text-text-muted">Loading suburb suggestions...</p>
            ) : null}
            {locationSuggestions.length > 0 ? (
              <div className="max-h-52 overflow-auto rounded-md border border-border bg-surface-2">
                {locationSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.suburb}-${suggestion.state}-${suggestion.postcode}`}
                    type="button"
                    className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-body-sm text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary last:border-b-0"
                    onClick={() => {
                      setSelectedLocation(suggestion);
                      setLocationInput(`${suggestion.suburb} ${suggestion.postcode}`);
                      setLocationSuggestions([]);
                      resetPagination();
                    }}
                  >
                    <span>
                      {suggestion.suburb}, {suggestion.state}
                    </span>
                    <span className="font-mono text-caption text-text-muted">{suggestion.postcode}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Select
            label="State"
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              resetPagination();
            }}
            placeholder="All states"
            options={states.map((item) => ({ value: item, label: item }))}
          />
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value as SortValue);
              resetPagination();
            }}
            options={[
              { value: "rating_desc", label: "Top rated" },
              { value: "authority_desc", label: "Highest BUYERHQRANK score" },
              { value: "experience_desc", label: "Most experience" },
              { value: "reviews_desc", label: "Most reviews" },
              { value: "newest_desc", label: "Newest profiles" },
              { value: "name_asc", label: "Name A-Z" },
            ]}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <Select
              label="Min rating"
              value={minRating}
              onChange={(event) => {
                setMinRating(event.target.value);
                resetPagination();
              }}
              placeholder="Any rating"
              options={[
                { value: "4", label: "4.0+" },
                { value: "4.5", label: "4.5+" },
              ]}
            />
            <Select
              label="Min experience"
              value={minExperience}
              onChange={(event) => {
                setMinExperience(event.target.value);
                resetPagination();
              }}
              options={[
                { value: "0", label: "Any" },
                { value: "1", label: "1+ years" },
                { value: "3", label: "3+ years" },
                { value: "5", label: "5+ years" },
                { value: "10", label: "10+ years" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <p className="font-mono text-label uppercase text-text-secondary">Specialization</p>
            <div className="grid gap-2">
              {specializations.map((item) => (
                <Checkbox
                  key={item}
                  checked={selectedSpecializations.includes(item)}
                  onChange={(checked) => onToggleSpecialization(item, checked)}
                  label={item}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <p className="font-mono text-label uppercase text-text-secondary">Popular suburbs</p>
            {topSuburbs.length === 0 ? (
              <p className="text-caption text-text-muted">Suburb hotspots will appear after a search.</p>
            ) : (
              <div className="flex max-h-36 flex-wrap gap-2 overflow-auto">
                {topSuburbs.slice(0, 12).map((hint) => (
                  <button
                    key={`sidebar-${hint.suburb}-${hint.state ?? "NA"}-${hint.postcode ?? "NA"}`}
                    type="button"
                    className="rounded-full border border-border-light bg-surface-2 px-3 py-1 text-caption text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
                    onClick={() => {
                      setSelectedLocation({
                        suburb: hint.suburb,
                        state: hint.state ?? "",
                        postcode: hint.postcode ?? "",
                      });
                      setLocationInput(`${hint.suburb}${hint.postcode ? ` ${hint.postcode}` : ""}`.trim());
                      resetPagination();
                    }}
                  >
                    {hint.suburb}
                    {hint.postcode ? ` (${hint.postcode})` : ""}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-border pt-3">
            <Checkbox
              checked={verifiedOnly}
              onChange={(checked) => {
                setVerifiedOnly(checked);
                resetPagination();
              }}
              label="Verified only"
            />
            <Checkbox
              checked={hasFeeOnly}
              onChange={(checked) => {
                setHasFeeOnly(checked);
                resetPagination();
              }}
              label="Fee structure available"
            />
            <Checkbox
              checked={hasReviewsOnly}
              onChange={(checked) => {
                setHasReviewsOnly(checked);
                resetPagination();
              }}
              label="Has review history"
            />
          </div>
          <div className="border-t border-border pt-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setSearch("");
                setLocationInput("");
                setSelectedLocation(null);
                setStateFilter("");
                setSelectedSpecializations([]);
                setVerifiedOnly(true);
                setHasFeeOnly(false);
                setHasReviewsOnly(false);
                setMinRating("");
                setMinExperience("0");
                setSortBy("rating_desc");
                setPage(1);
              }}
            >
              Reset all filters
            </Button>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-sm text-text-secondary">
              Showing <span className="text-text-primary">{total}</span> agents
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" loading={saveSearchLoading} onClick={() => void handleSaveSearch()}>
                Save search
              </Button>
              <Button variant={viewMode === "grid" ? "primary" : "secondary"} onClick={() => setViewMode("grid")}>
                <Grid2X2 size={14} />
                Grid
              </Button>
              <Button variant={viewMode === "list" ? "primary" : "secondary"} onClick={() => setViewMode("list")}>
                <List size={14} />
                List
              </Button>
            </div>
          </div>
          {showSaveSearchGate ? (
            <div className="rounded-md border border-border bg-surface-2 px-3 py-3">
              <p className="text-body-sm text-text-secondary">
                Sign up or log in to save this search and keep your shortlist synced across your buyer workflow.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <Link href="/signup">Create Buyer Account</Link>
                </Button>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/login">Buyer Login</Link>
                </Button>
              </div>
            </div>
          ) : null}
          {saveSearchNotice ? (
            <p className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-caption text-text-secondary">
              {saveSearchNotice}
            </p>
          ) : null}

          {loading && page === 1 ? (
            <div className={viewMode === "list" ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
              {Array.from({ length: 6 }, (_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
          ) : null}

          {warning ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
              {warning}
            </p>
          ) : null}

          {!loading && error ? (
            <ErrorState
              description={error}
              onRetry={() => {
                setPage(1);
                setAgents([]);
              }}
            />
          ) : null}

          {!loading && !error && agents.length === 0 ? (
            <EmptyState
              title="No agents found"
              description="No agents found in this state yet. Try expanding your search."
              actionLabel="Sign up to save your search"
              onAction={() => (window.location.href = "/signup")}
            />
          ) : null}

          {!error && agents.length > 0 ? (
            <div
              className={
                viewMode === "list" ? "grid gap-3" : "grid gap-3 md:grid-cols-2"
              }
            >
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} compact={viewMode === "list"} />
              ))}
            </div>
          ) : null}

          {hasMore && !error ? (
            <div>
              <Button
                variant="secondary"
                loading={loading && page > 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Load More
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
