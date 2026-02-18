"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Ban, CircleAlert } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AgentRow } from "@/lib/database.types";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";

type ActionState = "approving" | "rejecting" | null;

export default function AdminVerificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAgents, setPendingAgents] = useState<AgentRow[]>([]);
  const [activeAction, setActiveAction] = useState<Record<string, ActionState>>({});

  const loadPendingAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPanelData();
      setPendingAgents(payload.agents.filter((agent) => !agent.is_verified));
      setLoading(false);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load pending agents.");
      setPendingAgents([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingAgents();
  }, [loadPendingAgents]);

  const updateVerification = async (agent: AgentRow, action: "approve" | "reject") => {
    setActiveAction((current) => ({
      ...current,
      [agent.id]: action === "approve" ? "approving" : "rejecting",
    }));

    const patch =
      action === "approve"
        ? {
            is_verified: true,
            is_active: true,
            licence_verified_at: agent.licence_verified_at ?? new Date().toISOString(),
          }
        : {
            is_verified: false,
            is_active: false,
          };

    try {
      await runAdminAction({ type: "update_agent", id: agent.id, patch });
      setPendingAgents((current) => current.filter((item) => item.id !== agent.id));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update verification state.");
    }

    setActiveAction((current) => ({ ...current, [agent.id]: null }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Agency verifications</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Review pending agency applications, verify licence data, and approve directory visibility.
        </p>
      </section>

      {error ? <ErrorState description={error} onRetry={loadPendingAgents} /> : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
              <Skeleton className="mt-4 h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && pendingAgents.length === 0 ? (
        <EmptyState
          title="No pending applications"
          description="All current applications are already reviewed."
          actionLabel="Refresh"
          onAction={loadPendingAgents}
        />
      ) : null}

      {!loading && pendingAgents.length > 0 ? (
        <div className="space-y-3">
          {pendingAgents.map((agent) => {
            const action = activeAction[agent.id];
            return (
              <Card key={agent.id} className="p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-subheading">{agent.name}</h2>
                      <Badge variant="state">{agent.state ?? "No state"}</Badge>
                      {agent.is_active ? (
                        <Badge variant="specialization">Active</Badge>
                      ) : (
                        <Badge variant="category">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-body-sm text-text-secondary">
                      {agent.agency_name ?? "Independent advisor"} · {agent.email}
                    </p>

                    <div className="grid gap-2 text-caption text-text-secondary sm:grid-cols-2">
                      <p>
                        <span className="text-text-primary">Licence:</span>{" "}
                        {agent.licence_number ?? "Not provided"}
                      </p>
                      <p>
                        <span className="text-text-primary">Experience:</span>{" "}
                        {agent.years_experience ?? 0} years
                      </p>
                      <p>
                        <span className="text-text-primary">Applied:</span>{" "}
                        {new Date(agent.created_at).toLocaleDateString("en-AU")}
                      </p>
                      <p>
                        <span className="text-text-primary">Website:</span>{" "}
                        {agent.website_url ? (
                          <a
                            href={agent.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-text-primary"
                          >
                            View
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>

                    {agent.bio ? <p className="text-body-sm text-text-secondary">{agent.bio}</p> : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:flex-col">
                    <Button
                      variant="primary"
                      loading={action === "approving"}
                      onClick={() => updateVerification(agent, "approve")}
                      disabled={Boolean(action)}
                    >
                      <BadgeCheck size={16} />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      loading={action === "rejecting"}
                      onClick={() => updateVerification(agent, "reject")}
                      disabled={Boolean(action)}
                    >
                      <Ban size={16} />
                      Reject
                    </Button>
                    <p className="inline-flex items-center gap-1 text-caption text-text-muted">
                      <CircleAlert size={12} />
                      Manual review required
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
