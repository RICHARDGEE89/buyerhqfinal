"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";
import type { AgentRow, ContactSubmissionRow, EnquiryRow } from "@/lib/database.types";

type UserRoleFilter = "all" | "agent" | "buyer";

type BuyerSummary = {
  email: string;
  name: string;
  firstSeenAt: string;
  lastSeenAt: string;
  enquiryCount: number;
  contactCount: number;
  openEnquiries: number;
};

type UserListItem = {
  id: string;
  role: "agent" | "buyer";
  name: string;
  email: string;
  createdAt: string;
  detail: string;
  linkedAgentId?: string;
  openEnquiries?: number;
};

export default function UsersManagementContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [contacts, setContacts] = useState<ContactSubmissionRow[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>("all");
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchAdminPanelData();
      setAgents(payload.agents);
      setEnquiries(payload.enquiries);
      setContacts(payload.contacts);
      setWarning(payload.warning ?? null);
      setLoading(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load user data.");
      setAgents([]);
      setEnquiries([]);
      setContacts([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const buyerSummaries = useMemo(() => {
    const map = new Map<string, BuyerSummary>();

    enquiries.forEach((enquiry) => {
      const email = enquiry.buyer_email.toLowerCase();
      const existing = map.get(email);
      const name = enquiry.buyer_name || "Buyer";
      const created = enquiry.created_at;
      const isOpen = enquiry.status !== "closed";

      if (!existing) {
        map.set(email, {
          email,
          name,
          firstSeenAt: created,
          lastSeenAt: created,
          enquiryCount: 1,
          contactCount: 0,
          openEnquiries: isOpen ? 1 : 0,
        });
        return;
      }

      existing.name = existing.name === "Buyer" && name ? name : existing.name;
      existing.enquiryCount += 1;
      if (isOpen) existing.openEnquiries += 1;
      if (new Date(created) < new Date(existing.firstSeenAt)) existing.firstSeenAt = created;
      if (new Date(created) > new Date(existing.lastSeenAt)) existing.lastSeenAt = created;
    });

    contacts.forEach((contact) => {
      if (!contact.email) return;
      const email = contact.email.toLowerCase();
      const existing = map.get(email);
      const created = contact.created_at;
      const name = contact.name || "Buyer";

      if (!existing) {
        map.set(email, {
          email,
          name,
          firstSeenAt: created,
          lastSeenAt: created,
          enquiryCount: 0,
          contactCount: 1,
          openEnquiries: 0,
        });
        return;
      }

      existing.contactCount += 1;
      existing.name = existing.name === "Buyer" && name ? name : existing.name;
      if (new Date(created) < new Date(existing.firstSeenAt)) existing.firstSeenAt = created;
      if (new Date(created) > new Date(existing.lastSeenAt)) existing.lastSeenAt = created;
    });

    return Array.from(map.values());
  }, [contacts, enquiries]);

  const userRows = useMemo<UserListItem[]>(() => {
    const agentRows: UserListItem[] = agents.map((agent) => ({
      id: `agent-${agent.id}`,
      role: "agent",
      name: agent.name,
      email: agent.email,
      createdAt: agent.created_at,
      detail: `${agent.agency_name ?? "Independent advisor"} · ${agent.is_verified ? "Verified" : "Pending"} · ${
        agent.is_active ? "Active" : "Inactive"
      }`,
      linkedAgentId: agent.id,
    }));

    const buyerRows: UserListItem[] = buyerSummaries.map((buyer) => ({
      id: `buyer-${buyer.email}`,
      role: "buyer",
      name: buyer.name,
      email: buyer.email,
      createdAt: buyer.firstSeenAt,
      detail: `${buyer.enquiryCount} enquiries · ${buyer.contactCount} contact submissions · ${buyer.openEnquiries} open`,
      openEnquiries: buyer.openEnquiries,
    }));

    return [...agentRows, ...buyerRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [agents, buyerSummaries]);

  const filteredRows = userRows.filter((row) => {
    if (roleFilter !== "all" && row.role !== roleFilter) return false;
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term) ||
      row.detail.toLowerCase().includes(term)
    );
  });

  const setRowBusy = (rowId: string, busy: boolean) => {
    setActionBusy((current) => ({ ...current, [rowId]: busy }));
  };

  const deactivateAgent = async (agentId: string) => {
    const rowId = `agent-${agentId}`;
    setRowBusy(rowId, true);
    try {
      await runAdminAction({ type: "update_agent", id: agentId, patch: { is_active: false } });
      setAgents((current) => current.map((agent) => (agent.id === agentId ? { ...agent, is_active: false } : agent)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to deactivate agent.");
    }
    setRowBusy(rowId, false);
  };

  const closeBuyerEnquiries = async (buyerEmail: string) => {
    const rowId = `buyer-${buyerEmail}`;
    setRowBusy(rowId, true);
    try {
      await runAdminAction({ type: "close_buyer_enquiries", buyer_email: buyerEmail });
      setEnquiries((current) =>
        current.map((enquiry) =>
          enquiry.buyer_email.toLowerCase() === buyerEmail && enquiry.status !== "closed"
            ? { ...enquiry, status: "closed" }
            : enquiry
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to close buyer enquiries.");
    }
    setRowBusy(rowId, false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">User management</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          View account activity across agents and buyers. Moderate account status and close enquiry threads.
        </p>
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={userRows.length} />
        <StatCard label="Agents" value={agents.length} />
        <StatCard label="Buyers (activity)" value={buyerSummaries.length} />
        <StatCard label="Open enquiries" value={enquiries.filter((item) => item.status !== "closed").length} />
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_220px]">
        <Input
          label="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Name, email, details"
        />
        <Select
          label="Role"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as UserRoleFilter)}
          options={[
            { value: "all", label: "All users" },
            { value: "agent", label: "Agents" },
            { value: "buyer", label: "Buyers" },
          ]}
        />
      </section>

      {error ? <ErrorState description={error} onRetry={loadData} /> : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="p-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && filteredRows.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try expanding your filters."
          actionLabel="Reset"
          onAction={() => {
            setSearch("");
            setRoleFilter("all");
          }}
        />
      ) : null}

      {!loading && filteredRows.length > 0 ? (
        <div className="space-y-2">
          {filteredRows.map((row) => {
            const busy = Boolean(actionBusy[row.id]);
            return (
              <Card key={row.id} className="p-4">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-subheading">{row.name}</h2>
                      <span className="rounded-full border border-border-light bg-surface-2 px-2 py-1 font-mono text-caption uppercase text-text-secondary">
                        {row.role}
                      </span>
                    </div>
                    <p className="mt-1 text-body-sm text-text-secondary">{row.email}</p>
                    <p className="text-caption text-text-muted">{row.detail}</p>
                    <p className="text-caption text-text-muted">
                      First seen {new Date(row.createdAt).toLocaleDateString("en-AU")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {row.role === "agent" && row.linkedAgentId ? (
                      <>
                        <Button variant="secondary" asChild>
                          <Link href="/admin/agents">Open agent panel</Link>
                        </Button>
                        <Button
                          variant="destructive"
                          loading={busy}
                          disabled={busy}
                          onClick={() => deactivateAgent(row.linkedAgentId!)}
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : null}

                    {row.role === "buyer" ? (
                      <Button
                        variant="secondary"
                        loading={busy}
                        disabled={busy || (row.openEnquiries ?? 0) === 0}
                        onClick={() => closeBuyerEnquiries(row.email)}
                      >
                        Close open enquiries
                      </Button>
                    ) : null}
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
