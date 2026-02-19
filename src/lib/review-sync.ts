import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchSourceReviews, sourceTrustWeight } from "@/lib/external-review-providers";
import type { AgencyReviewSourceRow, Database } from "@/lib/database.types";
import { extractMissingColumnName, isMissingRelationError } from "@/lib/db-errors";

type SyncOptions = {
  sourceId?: string;
  force?: boolean;
};

export type ExternalReviewSyncResult = {
  scannedSources: number;
  syncedSources: number;
  insertedOrUpdated: number;
  skippedSources: number;
  errors: Array<{ sourceId: string; message: string }>;
  warning?: string;
};

function shouldSyncSource(source: AgencyReviewSourceRow, force: boolean) {
  if (!source.is_active) return false;
  if (force) return true;

  const frequency = source.sync_frequency_minutes ?? 360;
  if (!source.last_synced_at) return true;
  const last = new Date(source.last_synced_at).getTime();
  if (Number.isNaN(last)) return true;
  return Date.now() - last >= frequency * 60_000;
}

function coerceSource(row: unknown): AgencyReviewSourceRow | null {
  if (!row || typeof row !== "object") return null;
  const cast = row as AgencyReviewSourceRow;
  if (!cast.id || !cast.agent_id || !cast.external_id || !cast.source) return null;
  return cast;
}

export async function syncExternalReviews(
  client: SupabaseClient<Database>,
  options?: SyncOptions
): Promise<ExternalReviewSyncResult> {
  const force = Boolean(options?.force);
  const errors: Array<{ sourceId: string; message: string }> = [];

  const sourceQuery = client.from("agency_review_sources").select("*");
  const { data: sourceRows, error: sourceError } = options?.sourceId
    ? await sourceQuery.eq("id", options.sourceId)
    : await sourceQuery;

  if (sourceError) {
    if (isMissingRelationError(sourceError.message, "agency_review_sources")) {
      return {
        scannedSources: 0,
        syncedSources: 0,
        insertedOrUpdated: 0,
        skippedSources: 0,
        errors: [],
        warning:
          "Missing table agency_review_sources. Run supabase/add_external_reviews_and_broker_console.sql to enable sync.",
      };
    }
    return {
      scannedSources: 0,
      syncedSources: 0,
      insertedOrUpdated: 0,
      skippedSources: 0,
      errors: [{ sourceId: "n/a", message: sourceError.message }],
    };
  }

  const sources = (sourceRows ?? []).map(coerceSource).filter(Boolean) as AgencyReviewSourceRow[];
  let syncedSources = 0;
  let insertedOrUpdated = 0;
  let skippedSources = 0;

  for (const source of sources) {
    if (!shouldSyncSource(source, force)) {
      skippedSources += 1;
      continue;
    }

    try {
      const reviews = await fetchSourceReviews(source);
      if (reviews.length > 0) {
        const rows = reviews.map((review) => ({
          agent_id: source.agent_id,
          source_id: source.id,
          source: source.source,
          external_review_id: review.externalReviewId,
          reviewer_name: review.reviewerName,
          reviewer_avatar_url: review.reviewerAvatarUrl,
          rating: review.rating,
          review_text: review.reviewText,
          review_url: review.reviewUrl,
          reviewed_at: review.reviewedAt,
          helpful_count: review.helpfulCount,
          trust_weight: sourceTrustWeight(source.source),
          sync_metadata: review.metadata,
        }));

        let { error: upsertError } = await client.from("external_reviews").upsert(rows, {
          onConflict: "source,external_review_id,agent_id",
        });
        let didWriteRows = false;

        // Gracefully remove unknown columns for older schemas.
        for (let i = 0; i < 6 && upsertError; i += 1) {
          const missingColumn = extractMissingColumnName(upsertError.message, "external_reviews");
          if (!missingColumn) break;
          const strippedRows = rows.map((row) => {
            const next = { ...row } as Record<string, unknown>;
            delete next[missingColumn];
            return next;
          });
          ({ error: upsertError } = await client
            .from("external_reviews")
            .upsert(strippedRows as Database["public"]["Tables"]["external_reviews"]["Insert"][], {
              onConflict: "source,external_review_id,agent_id",
            }));
          if (!upsertError) {
            didWriteRows = true;
          }
        }

        if (upsertError) {
          errors.push({ sourceId: source.id, message: upsertError.message });
        } else {
          didWriteRows = true;
        }

        if (didWriteRows) {
          insertedOrUpdated += rows.length;
        }
      }

      const statusPatch = {
        last_synced_at: new Date().toISOString(),
        last_sync_status: "success" as const,
        last_sync_error: null,
      };
      const { error: statusError } = await client.from("agency_review_sources").update(statusPatch).eq("id", source.id);
      if (statusError) {
        errors.push({ sourceId: source.id, message: statusError.message });
      }

      syncedSources += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Review source sync failed.";
      errors.push({ sourceId: source.id, message });
      const failedPatch = {
        last_synced_at: new Date().toISOString(),
        last_sync_status: "failed" as const,
        last_sync_error: message.slice(0, 1000),
      };
      await client.from("agency_review_sources").update(failedPatch).eq("id", source.id);
    }
  }

  return {
    scannedSources: sources.length,
    syncedSources,
    insertedOrUpdated,
    skippedSources,
    errors,
  };
}
