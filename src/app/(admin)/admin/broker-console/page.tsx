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
import type {
  BrokerEnquiryNoteRow,
  BrokerEnquiryStateRow,
  EnquiryRow,
} from "@/lib/database.types";

type Stage = BrokerEnquiryStateRow["stage"];
type Priority = BrokerEnquiryStateRow["priority"];

const stageOptions: Array<{ value: Stage; label: string }> = [
  { value: "incoming", label: "Incoming" },
  { value: "qualified", label: "Qualified" },
  { value: "agent_outreach", label: "Agent Outreach" },
  { value: "waiting_agent", label: "Waiting Agent" },
  { value: "waiting_buyer", label: "Waiting Buyer" },
  { value: "handoff", label: "Handoff" },
  { value: "closed", label: "Closed" },
];

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

type DraftState = {
  stage: Stage;
  priority: Priority;
  owner_email: string;
  sla_due_at: string;
  next_action: string;
};

function statusToStage(status: EnquiryRow["status"]): Stage {
  if (status === "responded") return "handoff";
  if (status === "closed") return "closed";
  if (status === "viewed") return "qualified";
  return "incoming";
}

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

export default function BrokerConsolePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [brokerStates, setBrokerStates] = useState<BrokerEnquiryStateRow[]>([]);
  const [brokerNotes, setBrokerNotes] = useState<BrokerEnquiryNoteRow[]>([]);

  const [draftByEnquiryId, setDraftByEnquiryId] = useState<Record<string, DraftState>>({});
  const [noteByEnquiryId, setNoteByEnquiryId] = useState<Record<string, string>>({});
  const [busyByEnquiryId, setBusyByEnquiryId] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchAdminPanelData();
      setEnquiries(payload.enquiries);
      setBrokerStates(payload.brokerStates ?? []);
      setBrokerNotes(payload.brokerNotes ?? []);
      setWarning(payload.warning ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load broker console.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stateByEnquiryId = useMemo(() => {
    const map = new Map<string, BrokerEnquiryStateRow>();
    brokerStates.forEach((state) => map.set(state.enquiry_id, state));
    return map;
  }, [brokerStates]);

  const notesByEnquiryId = useMemo(() => {
    const map = new Map<string, BrokerEnquiryNoteRow[]>();
    brokerNotes.forEach((note) => {
      const list = map.get(note.enquiry_id) ?? [];
      list.push(note);
      map.set(note.enquiry_id, list);
    });
    map.forEach((list) => {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
    return map;
  }, [brokerNotes]);

  const enriched = useMemo(() => {
    return enquiries.map((enquiry) => {
      const state = stateByEnquiryId.get(enquiry.id);
      const draft = draftByEnquiryId[enquiry.id];
      const next: DraftState =
        draft ??
        (state
          ? {
            stage: state.stage,
            priority: state.priority,
            owner_email: state.owner_email ?? "",
            sla_due_at: toDatetimeLocal(state.sla_due_at),
            next_action: state.next_action ?? "",
          }
          : {
            stage: statusToStage(enquiry.status),
            priority: "normal",
            owner_email: "",
            sla_due_at: "",
            next_action: "",
          });
      return {
        enquiry,
        draft: next,
        notes: notesByEnquiryId.get(enquiry.id) ?? [],
      };
    });
  }, [draftByEnquiryId, enquiries, notesByEnquiryId, stateByEnquiryId]);

  const groupedByStage = useMemo(() => {
    return stageOptions.map((stage) => ({
      ...stage,
      items: enriched.filter((entry) => entry.draft.stage === stage.value),
    }));
  }, [enriched]);

  const setDraft = (enquiryId: string, patch: Partial<DraftState>) => {
    setDraftByEnquiryId((current) => {
      const existing = current[enquiryId] ?? {
        stage: "incoming" as Stage,
        priority: "normal" as Priority,
        owner_email: "",
        sla_due_at: "",
        next_action: "",
      };
      return {
        ...current,
        [enquiryId]: {
          ...existing,
          ...patch,
        },
      };
    });
  };

  const saveState = async (enquiryId: string) => {
    const draft = draftByEnquiryId[enquiryId];
    if (!draft) return;
    setBusyByEnquiryId((current) => ({ ...current, [enquiryId]: true }));
    setError(null);
    setResult(null);
    try {
      await runAdminAction({
        type: "upsert_broker_state",
        enquiry_id: enquiryId,
        patch: {
          stage: draft.stage,
          priority: draft.priority,
          owner_email: draft.owner_email || null,
          sla_due_at: draft.sla_due_at ? new Date(draft.sla_due_at).toISOString() : null,
          next_action: draft.next_action || null,
          last_touch_at: new Date().toISOString(),
        },
      });
      setResult("Broker state updated.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update broker state.");
    } finally {
      setBusyByEnquiryId((current) => ({ ...current, [enquiryId]: false }));
    }
  };

  const addNote = async (enquiryId: string) => {
    const note = noteByEnquiryId[enquiryId]?.trim();
    if (!note) return;
    setBusyByEnquiryId((current) => ({ ...current, [enquiryId]: true }));
    setError(null);
    setResult(null);
    try {
      await runAdminAction({
        type: "add_broker_note",
        enquiry_id: enquiryId,
        note,
        is_internal: true,
      });
      setResult("Broker note added.");
      setNoteByEnquiryId((current) => ({ ...current, [enquiryId]: "" }));
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to add broker note.");
    } finally {
      setBusyByEnquiryId((current) => ({ ...current, [enquiryId]: false }));
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

  if (error && enquiries.length === 0) {
    return <ErrorState description={error} onRetry={load} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Broker Console</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Operate enquiry pipeline, assign ownership, track SLAs, and keep internal broker notes.
        </p>
        {warning ? (
          <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
            {warning}
          </p>
        ) : null}
      </section>

      {enquiries.length === 0 ? (
        <EmptyState title="No enquiries available" />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {groupedByStage.map((stage) => (
            <Card key={stage.value} className="space-y-3 p-4">
              <h2 className="text-subheading">
                {stage.label} <span className="text-caption text-text-muted">({stage.items.length})</span>
              </h2>

              {stage.items.length === 0 ? (
                <p className="text-caption text-text-muted">No enquiries in this stage.</p>
              ) : (
                <div className="space-y-2">
                  {stage.items.map(({ enquiry, draft, notes }) => (
                    <div key={enquiry.id} className="rounded-md border border-border p-3">
                      <p className="text-body-sm text-text-primary">
                        {enquiry.buyer_name} · {enquiry.buyer_email}
                      </p>
                      <p className="text-caption text-text-secondary">
                        Status: {enquiry.status ?? "new"} · Created{" "}
                        {new Date(enquiry.created_at).toLocaleDateString("en-AU")}
                      </p>
                      <p className="mt-2 text-caption text-text-secondary line-clamp-2">
                        {enquiry.message || "No message provided"}
                      </p>

                      <div className="mt-3 grid gap-2">
                        <Select
                          label="Stage"
                          value={draft.stage}
                          onChange={(event) => setDraft(enquiry.id, { stage: event.target.value as Stage })}
                          options={stageOptions}
                        />
                        <Select
                          label="Priority"
                          value={draft.priority}
                          onChange={(event) => setDraft(enquiry.id, { priority: event.target.value as Priority })}
                          options={priorityOptions}
                        />
                        <Input
                          label="Owner email"
                          value={draft.owner_email}
                          onChange={(event) => setDraft(enquiry.id, { owner_email: event.target.value })}
                          placeholder="broker@buyerhq.com.au"
                        />
                        <Input
                          label="SLA due"
                          type="datetime-local"
                          value={draft.sla_due_at}
                          onChange={(event) => setDraft(enquiry.id, { sla_due_at: event.target.value })}
                        />
                        <Input
                          label="Next action"
                          value={draft.next_action}
                          onChange={(event) => setDraft(enquiry.id, { next_action: event.target.value })}
                          placeholder="Call agent and confirm fit"
                        />
                        <Button
                          variant="secondary"
                          loading={Boolean(busyByEnquiryId[enquiry.id])}
                          disabled={Boolean(busyByEnquiryId[enquiry.id])}
                          onClick={() => saveState(enquiry.id)}
                        >
                          Save broker state
                        </Button>
                      </div>

                      <div className="mt-3 space-y-2 rounded-md border border-border bg-surface-2 p-2">
                        <p className="font-mono text-label uppercase text-text-secondary">Internal notes</p>
                        {notes.slice(0, 2).map((note) => (
                          <div key={note.id} className="text-caption text-text-secondary">
                            <p>{note.note}</p>
                            <p className="text-text-muted">
                              {note.author_email || "Admin"} · {new Date(note.created_at).toLocaleString("en-AU")}
                            </p>
                          </div>
                        ))}
                        <Textarea
                          label="Add note"
                          value={noteByEnquiryId[enquiry.id] ?? ""}
                          onChange={(event) =>
                            setNoteByEnquiryId((current) => ({ ...current, [enquiry.id]: event.target.value }))
                          }
                          placeholder="Capture call outcomes, blockers, and next move."
                        />
                        <Button
                          size="sm"
                          loading={Boolean(busyByEnquiryId[enquiry.id])}
                          disabled={Boolean(busyByEnquiryId[enquiry.id])}
                          onClick={() => addNote(enquiry.id)}
                        >
                          Add note
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

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
