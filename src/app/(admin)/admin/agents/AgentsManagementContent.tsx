"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import type { AgentRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type FilterValue = "all" | "verified" | "pending" | "inactive";
type ActionValue = "verify" | "active" | "delete" | null;

export default function AgentsManagementContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [activeAction, setActiveAction] = useState<Record<string, ActionValue>>({});

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setAgents([]);
      setLoading(false);
      return;
    }

    setAgents(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const filteredAgents = agents.filter((agent) => {
    if (filter === "verified" && !agent.is_verified) return false;
    if (filter === "pending" && agent.is_verified) return false;
    if (filter === "inactive" && agent.is_active) return false;

    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      agent.name.toLowerCase().includes(term) ||
      (agent.agency_name ?? "").toLowerCase().includes(term) ||
      agent.email.toLowerCase().includes(term) ||
      (agent.state ?? "").toLowerCase().includes(term)
    );
  });

  const setAction = (id: string, action: ActionValue) => {
    setActiveAction((current) => ({ ...current, [id]: action }));
  };

  const toggleVerified = async (agent: AgentRow) => {
    setAction(agent.id, "verify");
    const payload = {
      is_verified: !agent.is_verified,
      licence_verified_at: !agent.is_verified ? new Date().toISOString() : null,
    };
    const { error: updateError } = await supabase.from("agents").update(payload).eq("id", agent.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setAgents((current) =>
        current.map((item) => (item.id === agent.id ? { ...item, ...payload } : item))
      );
    }
    setAction(agent.id, null);
  };

  const toggleActive = async (agent: AgentRow) => {
    setAction(agent.id, "active");
    const { error: updateError } = await supabase
      .from("agents")
      .update({ is_active: !agent.is_active })
      .eq("id", agent.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setAgents((current) =>
        current.map((item) => (item.id === agent.id ? { ...item, is_active: !agent.is_active } : item))
      );
    }
    setAction(agent.id, null);
  };

  const deleteAgent = async (agent: AgentRow) => {
    const confirmed = window.confirm(
      `Delete ${agent.name} (${agent.email})?\nThis also deletes linked reviews and enquiries.`
    );
    if (!confirmed) return;

    setAction(agent.id, "delete");
    const { error: deleteError } = await supabase.from("agents").delete().eq("id", agent.id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setAgents((current) => current.filter((item) => item.id !== agent.id));
    }
    setAction(agent.id, null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Agent management</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Manage directory eligibility, verification state, and account activity for all agents.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={agents.length} />
        <StatCard label="Verified" value={agents.filter((agent) => agent.is_verified).length} />
        <StatCard label="Pending verification" value={agents.filter((agent) => !agent.is_verified).length} />
        <StatCard label="Inactive" value={agents.filter((agent) => !agent.is_active).length} />
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          label="Search agents"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, agency, state"
        />
        <Select
          label="Filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterValue)}
          options={[
            { value: "all", label: "All agents" },
            { value: "verified", label: "Verified" },
            { value: "pending", label: "Pending verification" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </section>

      {error ? <ErrorState description={error} onRetry={loadAgents} /> : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && filteredAgents.length === 0 ? (
        <EmptyState
          title="No matching agents"
          description="Try changing the search term or filter."
          actionLabel="Reset"
          onAction={() => {
            setSearch("");
            setFilter("all");
          }}
        />
      ) : null}

      {!loading && filteredAgents.length > 0 ? (
        <div className="space-y-2">
          {filteredAgents.map((agent) => {
            const action = activeAction[agent.id];
            return (
              <Card key={agent.id} className="p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-subheading">{agent.name}</h2>
                      {agent.is_verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-1 font-mono text-caption uppercase text-success">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-full border border-border-light bg-surface-2 px-2 py-1 font-mono text-caption uppercase text-text-secondary">
                          Pending
                        </span>
                      )}
                      <span
                        className={`rounded-full border px-2 py-1 font-mono text-caption uppercase ${
                          agent.is_active
                            ? "border-border-light bg-surface-2 text-text-secondary"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                        }`}
                      >
                        {agent.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      {agent.agency_name ?? "Independent advisor"} · {agent.email}
                    </p>
                    <p className="text-caption text-text-muted">
                      {agent.state ?? "No state"} · Created{" "}
                      {new Date(agent.created_at).toLocaleDateString("en-AU")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      loading={action === "verify"}
                      onClick={() => toggleVerified(agent)}
                      disabled={Boolean(action)}
                    >
                      {agent.is_verified ? "Unverify" : "Verify"}
                    </Button>
                    <Button
                      variant="secondary"
                      loading={action === "active"}
                      onClick={() => toggleActive(agent)}
                      disabled={Boolean(action)}
                    >
                      {agent.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      loading={action === "delete"}
                      onClick={() => deleteAgent(agent)}
                      disabled={Boolean(action)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
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
