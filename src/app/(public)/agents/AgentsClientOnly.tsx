"use client";

import { useEffect, useMemo, useState } from "react";
import { Grid2X2, List, Map as MapIcon } from "lucide-react";

import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { AgentCardSkeleton } from "@/components/ui/Skeleton";
import type { AgentRow } from "@/lib/database.types";

const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const specializations = [
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
];

type ViewMode = "grid" | "list" | "map";

export default function AgentsClientOnly() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [topRatedOnly, setTopRatedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showMapModal, setShowMapModal] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 12;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (stateFilter) params.set("state", stateFilter);
    if (verifiedOnly) params.set("verified", "true");
    if (topRatedOnly) params.set("minRating", "4.5");
    if (search.trim()) params.set("search", search.trim());
    if (selectedSpecializations.length) {
      params.set("specializations", selectedSpecializations.join(","));
    }
    params.set("page", String(page));
    params.set("limit", String(limit));
    return params.toString();
  }, [limit, page, search, selectedSpecializations, stateFilter, topRatedOnly, verifiedOnly]);

  useEffect(() => {
    let cancelled = false;

    const fetchAgents = async () => {
      try {
        if (page === 1) setLoading(true);
        setError(null);

        const response = await fetch(`/api/agents?${queryString}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to fetch agents");

        if (cancelled) return;
        setTotal(data.total ?? 0);
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
  const stateBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    agents.forEach((agent) => {
      const key = agent.state ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [agents]);

  const topSuburbs = useMemo(() => {
    const suburbCounts = new Map<string, number>();
    agents.forEach((agent) => {
      (agent.suburbs ?? []).forEach((suburb) => {
        const key = suburb.trim();
        if (!key) return;
        suburbCounts.set(key, (suburbCounts.get(key) ?? 0) + 1);
      });
    });
    return Array.from(suburbCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [agents]);

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">Find buyer&apos;s agents</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">
          Filter by state, specialisation, and performance to build your shortlist.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[320px,1fr]">
        <aside className="space-y-3 rounded-lg border border-border bg-surface p-4">
          <Input
            label="Search"
            placeholder="Name, agency, suburb"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPagination();
            }}
          />
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
            <Checkbox
              checked={verifiedOnly}
              onChange={(checked) => {
                setVerifiedOnly(checked);
                resetPagination();
              }}
              label="Verified only"
            />
            <Checkbox
              checked={topRatedOnly}
              onChange={(checked) => {
                setTopRatedOnly(checked);
                resetPagination();
              }}
              label="Top rated (4.5+)"
            />
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-body-sm text-text-secondary">
              Showing <span className="text-text-primary">{total}</span> verified agents
            </p>
            <div className="flex gap-2">
              <Button variant={viewMode === "grid" ? "primary" : "secondary"} onClick={() => setViewMode("grid")}>
                <Grid2X2 size={14} />
                Grid
              </Button>
              <Button variant={viewMode === "list" ? "primary" : "secondary"} onClick={() => setViewMode("list")}>
                <List size={14} />
                List
              </Button>
              <Button
                variant={viewMode === "map" ? "primary" : "secondary"}
                onClick={() => {
                  setViewMode("map");
                  setShowMapModal(true);
                }}
              >
                <MapIcon size={14} />
                Map
              </Button>
            </div>
          </div>

          {loading && page === 1 ? (
            <div className={viewMode === "list" ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
              {Array.from({ length: 6 }, (_, i) => (
                <AgentCardSkeleton key={i} />
              ))}
            </div>
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
            />
          ) : null}

          {!error && agents.length > 0 ? (
            <div className={viewMode === "list" ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
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

      <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)} title="Map View">
        <div className="space-y-4">
          <p className="text-body-sm text-text-secondary">
            Live location coverage from current results. Use state and suburb filters to narrow this footprint.
          </p>

          <div className="space-y-2">
            <p className="font-mono text-label uppercase text-text-secondary">State coverage</p>
            <div className="flex flex-wrap gap-2">
              {stateBreakdown.map(([stateName, count]) => (
                <span
                  key={stateName}
                  className="rounded-full border border-border-light bg-surface-2 px-3 py-1 text-caption text-text-secondary"
                >
                  {stateName}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-label uppercase text-text-secondary">Top suburbs in results</p>
            {topSuburbs.length === 0 ? (
              <p className="text-caption text-text-muted">No suburb data available for these filters.</p>
            ) : (
              <div className="grid gap-1">
                {topSuburbs.map(([suburb, count]) => (
                  <p key={suburb} className="text-body-sm text-text-secondary">
                    <span className="text-text-primary">{suburb}</span> ({count})
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
