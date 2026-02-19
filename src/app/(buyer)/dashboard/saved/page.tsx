"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, MessageSquare, Trash2 } from "lucide-react";

import { AgentCard } from "@/components/AgentCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import type { AgentRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type SavedAgentRecord = {
  id: string;
  created_at: string;
  agent: AgentRow | null;
};

export default function SavedAgentsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedAgents, setSavedAgents] = useState<SavedAgentRecord[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  const loadSavedAgents = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/login";
      return;
    }

    const fullName = [toText(user.user_metadata?.first_name), toText(user.user_metadata?.last_name)]
      .filter(Boolean)
      .join(" ");
    setBuyerName(fullName || "BuyerHQ User");
    setBuyerEmail(user.email ?? "");
    setBuyerPhone(toText(user.user_metadata?.phone));

    const { data, error: fetchError } = await supabase
      .from("saved_agents")
      .select("id, created_at, agent:agents(*)")
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setSavedAgents([]);
      setLoading(false);
      return;
    }

    const records = ((data ?? []) as SavedAgentRecord[]).filter((item) => item.agent !== null);
    setSavedAgents(records);
    setSelected(records.map((item) => item.id));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadSavedAgents();
  }, [loadSavedAgents]);

  const toggleSelected = (savedId: string) => {
    setSelected((current) =>
      current.includes(savedId) ? current.filter((item) => item !== savedId) : [...current, savedId]
    );
  };

  const removeSaved = async (savedId: string) => {
    const { error: deleteError } = await supabase.from("saved_agents").delete().eq("id", savedId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setSavedAgents((current) => current.filter((item) => item.id !== savedId));
    setSelected((current) => current.filter((item) => item !== savedId));
  };

  const exportSelected = () => {
    const rows = savedAgents.filter((item) => selected.includes(item.id) && item.agent);
    if (rows.length === 0) {
      setBulkResult("Select at least one saved agent to export.");
      return;
    }

    const header = [
      "name",
      "agency",
      "state",
      "specializations",
      "rating",
      "reviews",
      "fee_structure",
      "introduction_channel",
    ];
    const lines = rows.map((row) => {
      const agent = row.agent!;
      return [
        csvValue(agent.name),
        csvValue(agent.agency_name ?? ""),
        csvValue(agent.state ?? ""),
        csvValue((agent.specializations ?? []).join("; ")),
        csvValue(agent.avg_rating?.toString() ?? ""),
        csvValue(agent.review_count?.toString() ?? ""),
        csvValue(agent.fee_structure ?? ""),
        csvValue("BuyerHQ brokered"),
      ].join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "buyerhq-saved-agents.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setBulkResult(`Exported ${rows.length} saved agent(s).`);
  };

  const sendBulkEnquiry = async () => {
    const targets = savedAgents.filter((item) => selected.includes(item.id) && item.agent);
    if (targets.length === 0) {
      setBulkResult("Select at least one saved agent.");
      return;
    }
    if (!buyerName.trim() || !buyerEmail.trim() || !bulkMessage.trim()) {
      setBulkResult("Name, email, and message are required.");
      return;
    }

    setSendingBulk(true);
    setBulkResult(null);

    const responses = await Promise.all(
      targets.map(async (item) => {
        const response = await fetch("/api/enquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent_id: item.agent!.id,
            buyer_name: buyerName.trim(),
            buyer_email: buyerEmail.trim(),
            buyer_phone: buyerPhone.trim() || undefined,
            message: bulkMessage.trim(),
          }),
        });
        return response.ok;
      })
    );

    const successCount = responses.filter(Boolean).length;
    const failCount = responses.length - successCount;
    setBulkResult(
      failCount > 0
        ? `${successCount} requests submitted, ${failCount} failed.`
        : `Successfully submitted ${successCount} brokered enquiry request(s).`
    );
    setSendingBulk(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && savedAgents.length === 0) {
    return <ErrorState description={error} onRetry={loadSavedAgents} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Saved agents</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Manage your shortlist, export your comparison list, and submit one brokered enquiry to multiple agents.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={exportSelected}>
          <Download size={14} />
          Export selected
        </Button>
        <Button onClick={() => setBulkModalOpen(true)} disabled={selected.length === 0}>
          <MessageSquare size={14} />
          Submit intro request
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/agents">Browse agents</Link>
        </Button>
      </div>

      {savedAgents.length === 0 ? (
        <EmptyState
          title="No saved agents yet"
          description="Shortlist agents from the directory to compare and submit brokered enquiries."
          actionLabel="Browse directory"
          onAction={() => (window.location.href = "/agents")}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {savedAgents.map((item) => (
            <Card key={item.id} className="space-y-3 p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex items-center gap-2 text-body-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    className="h-4 w-4 rounded border-border bg-surface-2"
                  />
                  Select
                </label>
                <Button variant="destructive" size="sm" onClick={() => removeSaved(item.id)}>
                  <Trash2 size={14} />
                  Remove
                </Button>
              </div>
              {item.agent ? <AgentCard agent={item.agent} compact /> : null}
            </Card>
          ))}
        </div>
      )}

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
          {error}
        </p>
      ) : null}
      {bulkResult ? (
        <p className="rounded-md border border-border-light bg-surface-2 px-3 py-2 text-body-sm text-text-secondary">
          {bulkResult}
        </p>
      ) : null}

      <Modal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} title="Submit brokered intro request">
        <div className="space-y-3">
          <Input label="Your name" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} />
          <Input
            label="Email"
            type="email"
            value={buyerEmail}
            onChange={(event) => setBuyerEmail(event.target.value)}
          />
          <Input
            label="Contact number (optional)"
            value={buyerPhone}
            onChange={(event) => setBuyerPhone(event.target.value)}
          />
          <Textarea
            label="Message"
            value={bulkMessage}
            onChange={(event) => setBulkMessage(event.target.value)}
            placeholder="Share your budget, location goals, and timeline. BuyerHQ will coordinate outreach."
          />
          <Button loading={sendingBulk} disabled={sendingBulk} fullWidth onClick={sendBulkEnquiry}>
            Submit brokered request
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function csvValue(input: string) {
  const escaped = input.replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}
