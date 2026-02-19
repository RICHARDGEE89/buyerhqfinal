"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";
import type { AgencyReviewSourceRow, AgentRow, ExternalReviewRow } from "@/lib/database.types";

const providerOptions: Array<{ label: string; value: AgencyReviewSourceRow["source"] }> = [
  { value: "google_places", label: "Google Places" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "rate_my_agent", label: "RateMyAgent" },
  { value: "facebook", label: "Facebook" },
  { value: "manual", label: "Manual/Feed" },
];

type ModerationFilter = "all" | "pending" | "approved" | "hidden";

export default function ReviewSourcesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [sources, setSources] = useState<AgencyReviewSourceRow[]>([]);
  const [externalReviews, setExternalReviews] = useState<ExternalReviewRow[]>([]);
  const [moderationFilter, setModerationFilter] = useState<ModerationFilter>("pending");
  const [syncing, setSyncing] = useState(false);

  const [agentId, setAgentId] = useState("");
  const [provider, setProvider] = useState<AgencyReviewSourceRow["source"]>("google_places");
  const [externalId, setExternalId] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [syncMinutes, setSyncMinutes] = useState("360");
  const [metadataJson, setMetadataJson] = useState("{}");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchAdminPanelData();
      setAgents(payload.agents);
      setSources(payload.reviewSources ?? []);
      setExternalReviews(payload.externalReviews ?? []);
      setWarning(payload.warning ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load review intelligence data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const agentNameById = useMemo(() => {
    const map = new Map<string, string>();
    agents.forEach((agent) => map.set(agent.id, agent.name));
    return map;
  }, [agents]);

  const filteredReviews = useMemo(() => {
    const sorted = [...externalReviews].sort(
      (a, b) => new Date(b.reviewed_at ?? b.created_at).getTime() - new Date(a.reviewed_at ?? a.created_at).getTime()
    );

    if (moderationFilter === "all") return sorted;
    if (moderationFilter === "approved") return sorted.filter((item) => item.is_approved && !item.is_hidden);
    if (moderationFilter === "hidden") return sorted.filter((item) => item.is_hidden);
    return sorted.filter((item) => !item.is_approved && !item.is_hidden);
  }, [externalReviews, moderationFilter]);

  const createSource = async () => {
    setError(null);
    setResult(null);

    if (!agentId || !externalId.trim()) {
      setError("Agent and external id are required.");
      return;
    }

    let metadata: Record<string, unknown> = {};
    if (metadataJson.trim()) {
      try {
        metadata = JSON.parse(metadataJson);
      } catch {
        setError("Metadata must be valid JSON.");
        return;
      }
    }

    setCreating(true);
    try {
      await runAdminAction({
        type: "upsert_review_source",
        source: {
          agent_id: agentId,
          source: provider,
          external_id: externalId.trim(),
          external_url: externalUrl.trim() || null,
          source_name: sourceName.trim() || null,
          sync_frequency_minutes: Number.parseInt(syncMinutes, 10) || 360,
          metadata,
          is_active: true,
        },
      });
      setResult("Review source saved.");
      setExternalId("");
      setExternalUrl("");
      setSourceName("");
      setMetadataJson("{}");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to save source.");
    } finally {
      setCreating(false);
    }
  };

  const deleteSource = async (id: string) => {
    setError(null);
    setResult(null);
    try {
      await runAdminAction({ type: "delete_review_source", id });
      setResult("Review source removed.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete source.");
    }
  };

  const syncSources = async (sourceId?: string) => {
    setSyncing(true);
    setError(null);
    setResult(null);
    try {
      await runAdminAction({ type: "sync_external_reviews", sourceId, force: true });
      setResult(sourceId ? "Source sync triggered." : "External review sync triggered.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to trigger sync.");
    } finally {
      setSyncing(false);
    }
  };

  const moderateReview = async (review: ExternalReviewRow, patch: Partial<Pick<ExternalReviewRow, "is_approved" | "is_hidden" | "is_featured">>) => {
    setError(null);
    setResult(null);
    try {
      await runAdminAction({ type: "set_external_review_state", id: review.id, patch });
      setResult("External review moderation updated.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update review moderation.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && sources.length === 0 && externalReviews.length === 0) {
    return <ErrorState description={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Review sources & moderation</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Map external review provider IDs to each agent, trigger sync jobs, and moderate imported reviews.
        </p>
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-subheading">Create source mapping</h2>
          <Button variant="secondary" loading={syncing} disabled={syncing} onClick={() => syncSources()}>
            Sync all sources now
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Agent"
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            options={agents.map((agent) => ({ value: agent.id, label: `${agent.name} (${agent.agency_name ?? "Independent"})` }))}
            placeholder="Select agent"
          />
          <Select
            label="Source"
            value={provider}
            onChange={(event) => setProvider(event.target.value as AgencyReviewSourceRow["source"])}
            options={providerOptions}
          />
          <Input
            label="External ID"
            value={externalId}
            onChange={(event) => setExternalId(event.target.value)}
            placeholder="Place ID / Business Unit ID / page slug"
          />
          <Input
            label="External URL (optional)"
            value={externalUrl}
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Source label (optional)"
            value={sourceName}
            onChange={(event) => setSourceName(event.target.value)}
            placeholder="e.g. Brisbane Office Reviews"
          />
          <Input
            label="Sync frequency (minutes)"
            value={syncMinutes}
            onChange={(event) => setSyncMinutes(event.target.value)}
            placeholder="360"
          />
          <div className="md:col-span-2">
            <Textarea
              label="Metadata JSON (optional)"
              value={metadataJson}
              onChange={(event) => setMetadataJson(event.target.value)}
              placeholder='{"feed_url":"https://..."}'
            />
          </div>
        </div>
        <Button loading={creating} disabled={creating} onClick={createSource}>
          Save source mapping
        </Button>
      </Card>

      <Card className="space-y-3 p-4">
        <h2 className="text-subheading">Mapped review sources</h2>
        {sources.length === 0 ? (
          <EmptyState title="No review sources yet" />
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div key={source.id} className="rounded-md border border-border p-3">
                <p className="text-body-sm text-text-primary">
                  {agentNameById.get(source.agent_id) ?? source.agent_id} · {source.source}
                </p>
                <p className="text-caption text-text-secondary">
                  External ID: {source.external_id} · Last sync:{" "}
                  {source.last_synced_at ? new Date(source.last_synced_at).toLocaleString("en-AU") : "Never"}
                </p>
                <p className="text-caption text-text-muted">
                  Status: {source.last_sync_status ?? "idle"} {source.last_sync_error ? `· ${source.last_sync_error}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" loading={syncing} disabled={syncing} onClick={() => syncSources(source.id)}>
                    Sync now
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteSource(source.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-subheading">External reviews moderation</h2>
          <Select
            value={moderationFilter}
            onChange={(event) => setModerationFilter(event.target.value as ModerationFilter)}
            options={[
              { value: "pending", label: "Pending moderation" },
              { value: "approved", label: "Approved" },
              { value: "hidden", label: "Hidden" },
              { value: "all", label: "All" },
            ]}
          />
        </div>
        {filteredReviews.length === 0 ? (
          <EmptyState title="No external reviews for this filter" />
        ) : (
          <div className="space-y-2">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-md border border-border p-3">
                <p className="text-body-sm text-text-primary">
                  {agentNameById.get(review.agent_id) ?? review.agent_id} · {review.source} · {review.rating.toFixed(1)}/5
                </p>
                <p className="text-caption text-text-secondary">
                  {review.reviewer_name || "Anonymous"} ·{" "}
                  {new Date(review.reviewed_at ?? review.created_at).toLocaleDateString("en-AU")}
                </p>
                <p className="mt-2 text-body-sm text-text-secondary">{review.review_text || "No text provided."}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => moderateReview(review, { is_approved: true, is_hidden: false })}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => moderateReview(review, { is_hidden: !review.is_hidden })}
                  >
                    {review.is_hidden ? "Unhide" : "Hide"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => moderateReview(review, { is_featured: !review.is_featured })}
                  >
                    {review.is_featured ? "Unfeature" : "Feature"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-caption text-text-secondary">
          {result}
        </p>
      ) : null}
    </div>
  );
}
