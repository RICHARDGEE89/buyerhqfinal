"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";
import type { AgentRow } from "@/lib/database.types";

type FilterValue = "all" | "verified" | "pending" | "inactive" | "claimed";
type ActionValue = "save" | "claim" | "delete" | null;
type BulkActionValue = "save" | "claim" | "delete" | null;

type AgentDraft = {
  name: string;
  agency_name: string;
  state: string;
  suburbs: string;
  specialist: string;
  fee_structure: string;
  website_url: string;
  verified: "Verified" | "Unverified";
  profile_status: "Claimed" | "Unclaimed";
  is_active: "true" | "false";
  instagram_followers: string;
  facebook_followers: string;
  tiktok_followers: string;
  youtube_subscribers: string;
  google_rating: string;
  google_reviews: string;
  facebook_rating: string;
  facebook_reviews: string;
};

const stateOptions = ["", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const specialistOptions = [
  "",
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type QuickAddDraft = {
  name: string;
  email: string;
  agency_name: string;
  state: string;
  phone: string;
  suburbs: string;
  specializations: string;
  fee_structure: string;
  website_url: string;
};

export default function AgentsManagementContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, AgentDraft>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [activeAction, setActiveAction] = useState<Record<string, ActionValue>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkActionValue>(null);
  const [quickAdd, setQuickAdd] = useState<QuickAddDraft>({
    name: "",
    email: "",
    agency_name: "",
    state: "",
    phone: "",
    suburbs: "",
    specializations: "",
    fee_structure: "",
    website_url: "",
  });
  const [quickAddBusy, setQuickAddBusy] = useState(false);
  const [quickAddResult, setQuickAddResult] = useState<string | null>(null);

  const hydrateDrafts = useCallback((rows: AgentRow[]) => {
    const next: Record<string, AgentDraft> = {};
    rows.forEach((agent) => {
      next[agent.id] = {
        name: agent.name,
        agency_name: agent.agency_name ?? "",
        state: agent.state ?? "",
        suburbs: (agent.suburbs ?? []).join(", "),
        specialist:
          (agent.specializations ?? []).find((item) => specialistOptions.includes(item)) ??
          "",
        fee_structure: agent.fee_structure ?? "",
        website_url: agent.website_url ?? "",
        verified: agent.verified ?? (agent.is_verified ? "Verified" : "Unverified"),
        profile_status: agent.profile_status ?? "Unclaimed",
        is_active: agent.is_active ? "true" : "false",
        instagram_followers: String(agent.instagram_followers ?? 0),
        facebook_followers: String(agent.facebook_followers ?? 0),
        tiktok_followers: String(agent.tiktok_followers ?? 0),
        youtube_subscribers: String(agent.youtube_subscribers ?? 0),
        google_rating: String(agent.google_rating ?? 0),
        google_reviews: String(agent.google_reviews ?? 0),
        facebook_rating: String(agent.facebook_rating ?? 0),
        facebook_reviews: String(agent.facebook_reviews ?? 0),
      };
    });
    setDrafts(next);
  }, []);

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPanelData();
      setAgents(payload.agents);
      setWarning(payload.warning ?? null);
      hydrateDrafts(payload.agents);
      setSelectedIds([]);
      setLoading(false);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load agents.");
      setAgents([]);
      setDrafts({});
      setLoading(false);
    }
  }, [hydrateDrafts]);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (filter === "verified" && agent.verified !== "Verified") return false;
      if (filter === "pending" && agent.verified === "Verified") return false;
      if (filter === "inactive" && agent.is_active) return false;
      if (filter === "claimed" && agent.profile_status !== "Claimed") return false;

      if (!search.trim()) return true;
      const term = search.trim().toLowerCase();
      return (
        agent.name.toLowerCase().includes(term) ||
        (agent.agency_name ?? "").toLowerCase().includes(term) ||
        agent.email.toLowerCase().includes(term) ||
        (agent.state ?? "").toLowerCase().includes(term)
      );
    });
  }, [agents, filter, search]);

  const setAction = (id: string, action: ActionValue) => {
    setActiveAction((current) => ({ ...current, [id]: action }));
  };

  const toggleSelected = (agentId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (checked) {
        if (current.includes(agentId)) return current;
        return [...current, agentId];
      }
      return current.filter((id) => id !== agentId);
    });
  };

  const allVisibleSelected =
    filteredAgents.length > 0 && filteredAgents.every((agent) => selectedIds.includes(agent.id));

  const toggleSelectAllVisible = (checked: boolean) => {
    if (!checked) {
      const visibleSet = new Set(filteredAgents.map((agent) => agent.id));
      setSelectedIds((current) => current.filter((id) => !visibleSet.has(id)));
      return;
    }
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredAgents.forEach((agent) => next.add(agent.id));
      return Array.from(next);
    });
  };

  const updateDraft = <K extends keyof AgentDraft>(id: string, key: K, value: AgentDraft[K]) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: value,
      },
    }));
  };

  const updateQuickAdd = <K extends keyof QuickAddDraft>(key: K, value: QuickAddDraft[K]) => {
    setQuickAdd((current) => ({ ...current, [key]: value }));
  };

  const createQuickAgent = async () => {
    const name = quickAdd.name.trim();
    const email = quickAdd.email.trim().toLowerCase();
    const agencyName = quickAdd.agency_name.trim();
    const state = quickAdd.state.trim().toUpperCase();

    if (!name || !email || !agencyName || !state) {
      setQuickAddResult("Name, email, agency, and state are required.");
      return;
    }
    if (!emailPattern.test(email)) {
      setQuickAddResult("Enter a valid email address.");
      return;
    }

    setQuickAddBusy(true);
    setQuickAddResult(null);
    setError(null);

    try {
      await runAdminAction({
        type: "create_agent",
        agent: {
          name,
          email,
          agency_name: agencyName,
          state,
          phone: quickAdd.phone.trim() || null,
          suburbs: splitCsv(quickAdd.suburbs),
          specializations: splitCsv(quickAdd.specializations),
          fee_structure: quickAdd.fee_structure.trim() || null,
          website_url: quickAdd.website_url.trim() || null,
          is_active: true,
          is_verified: false,
        },
      });
      setQuickAddResult("Agent added successfully.");
      setQuickAdd({
        name: "",
        email: "",
        agency_name: "",
        state: "",
        phone: "",
        suburbs: "",
        specializations: "",
        fee_structure: "",
        website_url: "",
      });
      await loadAgents();
    } catch (createError) {
      setQuickAddResult(createError instanceof Error ? createError.message : "Unable to add agent.");
    } finally {
      setQuickAddBusy(false);
    }
  };

  const saveRow = async (agentId: string) => {
    const draft = drafts[agentId];
    if (!draft) return;

    setAction(agentId, "save");
    setError(null);

    try {
      await runAdminAction({
        type: "update_agent",
        id: agentId,
        patch: buildPatchFromDraft(draft),
      });
      await loadAgents();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to save row.");
    } finally {
      setAction(agentId, null);
    }
  };

  const claimProfile = async (agentId: string) => {
    setAction(agentId, "claim");
    setError(null);
    try {
      await runAdminAction({ type: "claim_agent_profile", id: agentId });
      await loadAgents();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Unable to claim profile.");
    } finally {
      setAction(agentId, null);
    }
  };

  const bulkSaveSelected = async () => {
    if (selectedIds.length === 0) return;
    setBulkAction("save");
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((agentId) => {
          const draft = drafts[agentId];
          if (!draft) {
            return Promise.reject(new Error(`Draft not found for ${agentId}`));
          }
          return runAdminAction({
            type: "update_agent",
            id: agentId,
            patch: buildPatchFromDraft(draft),
          });
        })
      );
      const failed = results.filter((item) => item.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} selected row(s) failed to save. Review and retry.`);
      }
      await loadAgents();
    } finally {
      setBulkAction(null);
    }
  };

  const bulkClaimSelected = async () => {
    if (selectedIds.length === 0) return;
    setBulkAction("claim");
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedIds.map((agentId) => runAdminAction({ type: "claim_agent_profile", id: agentId }))
      );
      const failed = results.filter((item) => item.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} selected row(s) failed to claim. Review and retry.`);
      }
      await loadAgents();
    } finally {
      setBulkAction(null);
    }
  };

  const bulkDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const selectedAgents = agents.filter((agent) => selectedIds.includes(agent.id));
    if (selectedAgents.length === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedAgents.length} selected profile(s)? This also deletes linked reviews and enquiries.`
    );
    if (!confirmed) return;

    setBulkAction("delete");
    setError(null);
    try {
      const results = await Promise.allSettled(
        selectedAgents.map((agent) => runAdminAction({ type: "delete_agent", id: agent.id }))
      );
      const failed = results.filter((item) => item.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} selected row(s) failed to delete. Review and retry.`);
      }
      await loadAgents();
    } finally {
      setBulkAction(null);
    }
  };

  const deleteAgent = async (agent: AgentRow) => {
    const confirmed = window.confirm(
      `Delete ${agent.name} (${agent.email})?\nThis also deletes linked reviews and enquiries.`
    );
    if (!confirmed) return;

    setAction(agent.id, "delete");
    setError(null);
    try {
      await runAdminAction({ type: "delete_agent", id: agent.id });
      await loadAgents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete agent.");
    } finally {
      setAction(agent.id, null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Agent management</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Edit profile data inline, claim profiles, and keep BUYERHQRANK metrics up to date automatically.
        </p>
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-subheading">Quick add agent</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Fast onboarding for new agents without editing the full spreadsheet.
            </p>
          </div>
          <Button loading={quickAddBusy} disabled={quickAddBusy} onClick={() => void createQuickAgent()}>
            <UserPlus size={14} />
            Add agent
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Full name"
            value={quickAdd.name}
            onChange={(event) => updateQuickAdd("name", event.target.value)}
            placeholder="Required"
          />
          <Input
            label="Email"
            type="email"
            value={quickAdd.email}
            onChange={(event) => updateQuickAdd("email", event.target.value)}
            placeholder="Required"
          />
          <Input
            label="Agency"
            value={quickAdd.agency_name}
            onChange={(event) => updateQuickAdd("agency_name", event.target.value)}
            placeholder="Required"
          />
          <Select
            label="State"
            value={quickAdd.state}
            onChange={(event) => updateQuickAdd("state", event.target.value)}
            options={stateOptions
              .filter(Boolean)
              .map((item) => ({ value: item, label: item }))}
            placeholder="Required"
          />
          <Input
            label="Phone"
            value={quickAdd.phone}
            onChange={(event) => updateQuickAdd("phone", event.target.value)}
          />
          <Input
            label="Suburbs (comma separated)"
            value={quickAdd.suburbs}
            onChange={(event) => updateQuickAdd("suburbs", event.target.value)}
            placeholder="e.g. Newtown, Surry Hills"
          />
          <Input
            label="Specializations (comma separated)"
            value={quickAdd.specializations}
            onChange={(event) => updateQuickAdd("specializations", event.target.value)}
            placeholder="e.g. Negotiation, Auction Bidding"
          />
          <Input
            label="Fee structure"
            value={quickAdd.fee_structure}
            onChange={(event) => updateQuickAdd("fee_structure", event.target.value)}
          />
        </div>
        <Input
          label="Website URL"
          value={quickAdd.website_url}
          onChange={(event) => updateQuickAdd("website_url", event.target.value)}
          placeholder="https://"
        />
        {quickAddResult ? (
          <p className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-body-sm text-text-secondary">
            {quickAddResult}
          </p>
        ) : null}
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total" value={agents.length} />
        <StatCard label="Verified" value={agents.filter((agent) => agent.verified === "Verified").length} />
        <StatCard label="Claimed" value={agents.filter((agent) => agent.profile_status === "Claimed").length} />
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
            { value: "pending", label: "Unverified" },
            { value: "claimed", label: "Claimed profile" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </section>
      <section className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={bulkAction === "save"}
          disabled={bulkAction !== null || selectedIds.length === 0}
          onClick={() => void bulkSaveSelected()}
        >
          Save selected
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={bulkAction === "claim"}
          disabled={bulkAction !== null || selectedIds.length === 0}
          onClick={() => void bulkClaimSelected()}
        >
          Claim selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          loading={bulkAction === "delete"}
          disabled={bulkAction !== null || selectedIds.length === 0}
          onClick={() => void bulkDeleteSelected()}
        >
          Delete selected
        </Button>
        <span className="text-caption text-text-secondary">{selectedIds.length} selected</span>
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
        <Card className="overflow-x-auto p-0">
          <table className="min-w-[1800px] border-collapse text-body-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left font-mono text-label uppercase text-text-secondary">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => toggleSelectAllVisible(event.target.checked)}
                    className="h-4 w-4 rounded border-border bg-surface-2"
                  />
                </th>
                <th className="px-3 py-2">Agent Name</th>
                <th className="px-3 py-2">Agency Name</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Specialist</th>
                <th className="px-3 py-2">Fee Structure</th>
                <th className="px-3 py-2">Website</th>
                <th className="px-3 py-2">Verified</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">IG</th>
                <th className="px-3 py-2">FB</th>
                <th className="px-3 py-2">TikTok</th>
                <th className="px-3 py-2">YouTube</th>
                <th className="px-3 py-2">Google rating</th>
                <th className="px-3 py-2">Google reviews</th>
                <th className="px-3 py-2">Facebook rating</th>
                <th className="px-3 py-2">Facebook reviews</th>
                <th className="px-3 py-2">Followers</th>
                <th className="px-3 py-2">Buyer HQ Rank</th>
                <th className="px-3 py-2">Claimed at</th>
                <th className="px-3 py-2">Last updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => {
                const draft = drafts[agent.id];
                const action = activeAction[agent.id];
                if (!draft) return null;

                return (
                  <tr key={agent.id} className="border-b border-border align-top">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(agent.id)}
                        onChange={(event) => toggleSelected(agent.id, event.target.checked)}
                        className="h-4 w-4 rounded border-border bg-surface-2"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.name}
                        onChange={(event) => updateDraft(agent.id, "name", event.target.value)}
                        className="w-44 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.agency_name}
                        onChange={(event) => updateDraft(agent.id, "agency_name", event.target.value)}
                        className="w-44 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.state}
                        onChange={(event) => updateDraft(agent.id, "state", event.target.value)}
                        className="w-24 rounded-md border border-border bg-surface px-2 py-1"
                      >
                        {stateOptions.map((state) => (
                          <option key={`state-${state || "blank"}`} value={state}>
                            {state || "All"}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.suburbs}
                        onChange={(event) => updateDraft(agent.id, "suburbs", event.target.value)}
                        className="w-56 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.specialist}
                        onChange={(event) => updateDraft(agent.id, "specialist", event.target.value)}
                        className="w-56 rounded-md border border-border bg-surface px-2 py-1"
                      >
                        {specialistOptions.map((item) => (
                          <option key={`spec-${item || "blank"}`} value={item}>
                            {item || "No verified specialist yet."}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.fee_structure}
                        onChange={(event) => updateDraft(agent.id, "fee_structure", event.target.value)}
                        className="w-56 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.website_url}
                        onChange={(event) => updateDraft(agent.id, "website_url", event.target.value)}
                        className="w-52 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.verified}
                        onChange={(event) =>
                          updateDraft(agent.id, "verified", event.target.value as AgentDraft["verified"])
                        }
                        className="w-28 rounded-md border border-border bg-surface px-2 py-1"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Unverified">Unverified</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.profile_status}
                        onChange={(event) =>
                          updateDraft(agent.id, "profile_status", event.target.value as AgentDraft["profile_status"])
                        }
                        className="w-28 rounded-md border border-border bg-surface px-2 py-1"
                      >
                        <option value="Unclaimed">Unclaimed</option>
                        <option value="Claimed">Claimed</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={draft.is_active}
                        onChange={(event) => updateDraft(agent.id, "is_active", event.target.value as AgentDraft["is_active"])}
                        className="w-24 rounded-md border border-border bg-surface px-2 py-1"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.instagram_followers}
                        onChange={(event) => updateDraft(agent.id, "instagram_followers", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.facebook_followers}
                        onChange={(event) => updateDraft(agent.id, "facebook_followers", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.tiktok_followers}
                        onChange={(event) => updateDraft(agent.id, "tiktok_followers", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.youtube_subscribers}
                        onChange={(event) => updateDraft(agent.id, "youtube_subscribers", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.google_rating}
                        onChange={(event) => updateDraft(agent.id, "google_rating", event.target.value)}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.google_reviews}
                        onChange={(event) => updateDraft(agent.id, "google_reviews", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.facebook_rating}
                        onChange={(event) => updateDraft(agent.id, "facebook_rating", event.target.value)}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={draft.facebook_reviews}
                        onChange={(event) => updateDraft(agent.id, "facebook_reviews", digitsOnly(event.target.value))}
                        className="w-20 rounded-md border border-border bg-surface px-2 py-1"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-text-primary">{agent.total_followers ?? 0}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center rounded-full border border-border px-2 py-1 font-mono text-caption text-text-secondary">
                        Buyer HQ Rank: {formatRankLabel(agent.buyerhqrank)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-caption text-text-secondary">
                      {agent.claimed_at ? new Date(agent.claimed_at).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-3 py-2 text-caption text-text-secondary">
                      {agent.last_updated ? new Date(agent.last_updated).toLocaleDateString("en-AU") : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          loading={action === "save"}
                          onClick={() => void saveRow(agent.id)}
                          disabled={Boolean(action) || bulkAction !== null}
                        >
                          Save
                        </Button>
                        {agent.profile_status !== "Claimed" ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={action === "claim"}
                            onClick={() => void claimProfile(agent.id)}
                            disabled={Boolean(action) || bulkAction !== null}
                          >
                            <ShieldCheck size={14} />
                            Claim
                          </Button>
                        ) : null}
                        <Button
                          variant="destructive"
                          size="sm"
                          loading={action === "delete"}
                          onClick={() => void deleteAgent(agent)}
                          disabled={Boolean(action) || bulkAction !== null}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toInt(value: string) {
  const parsed = Number.parseInt(value || "0", 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function toFloat(value: string) {
  const parsed = Number.parseFloat(value || "0");
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(5, parsed));
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function buildPatchFromDraft(draft: AgentDraft) {
  return {
    name: draft.name.trim(),
    agency_name: draft.agency_name.trim() || null,
    state: draft.state || null,
    suburbs: splitCsv(draft.suburbs),
    specializations: draft.specialist ? [draft.specialist] : [],
    fee_structure: draft.fee_structure.trim() || null,
    website_url: draft.website_url.trim() || null,
    verified: draft.verified,
    profile_status: draft.profile_status,
    is_active: draft.is_active === "true",
    instagram_followers: toInt(draft.instagram_followers),
    facebook_followers: toInt(draft.facebook_followers),
    tiktok_followers: toInt(draft.tiktok_followers),
    youtube_subscribers: toInt(draft.youtube_subscribers),
    google_rating: toFloat(draft.google_rating),
    google_reviews: toInt(draft.google_reviews),
    facebook_rating: toFloat(draft.facebook_rating),
    facebook_reviews: toInt(draft.facebook_reviews),
  };
}

function formatRankLabel(value: string | null | undefined) {
  const base = (value || "STARTER").toLowerCase();
  return base
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
