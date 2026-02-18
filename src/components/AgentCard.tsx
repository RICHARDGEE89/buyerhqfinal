"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Heart } from "lucide-react";

import type { AgentRow } from "@/lib/database.types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Rating } from "@/components/ui/Rating";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";

type EnquiryPayload = {
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string;
};

export function AgentCard({
  agent,
  compact = false,
}: {
  agent: AgentRow;
  compact?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const suburbsLabel = useMemo(() => {
    const suburbs = agent.suburbs ?? [];
    if (suburbs.length === 0) return "Australia-wide coverage";
    if (suburbs.length <= 4) return suburbs.join(", ");
    return `${suburbs.slice(0, 4).join(", ")} +${suburbs.length - 4} more`;
  }, [agent.suburbs]);

  return (
    <>
      <Card interactive className="h-full p-4">
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={agent.name} src={agent.avatar_url} size="md" />
              <div>
                <h3 className="text-subheading text-text-primary">{agent.name}</h3>
                <p className="text-body-sm text-text-secondary">{agent.agency_name ?? "Independent Advisor"}</p>
              </div>
            </div>
            {agent.is_verified ? <Badge variant="verified">Verified</Badge> : null}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {agent.state ? <Badge variant="state">{agent.state}</Badge> : null}
              <Badge variant="state">Suburbs: {suburbsLabel}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {(agent.specializations ?? []).slice(0, compact ? 2 : 3).map((specialization) => (
                <Badge key={specialization} variant="specialization">
                  {specialization}
                </Badge>
              ))}
            </div>
          </div>

          <Rating value={agent.avg_rating} reviewCount={agent.review_count ?? 0} />

          <div className="grid grid-cols-2 gap-2 text-caption text-text-secondary">
            <div className="rounded-md border border-border px-2 py-1">
              <span className="font-mono text-label uppercase">Experience</span>
              <p className="text-body-sm text-text-primary">{agent.years_experience ?? 0} yrs</p>
            </div>
            <div className="rounded-md border border-border px-2 py-1">
              <span className="font-mono text-label uppercase">Purchased</span>
              <p className="text-body-sm text-text-primary">{agent.properties_purchased ?? 0}</p>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
            <p className="font-mono text-label uppercase text-text-secondary">Fee Structure</p>
            <p className="text-body-sm text-text-primary">{agent.fee_structure ?? "Fee details on request"}</p>
          </div>

          <div className="mt-auto grid grid-cols-3 gap-2">
            <Button variant="secondary" asChild>
              <Link href={`/agents/${agent.id}`}>View Profile</Link>
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Enquire
            </Button>
            <Button
              variant="secondary"
              loading={saveLoading}
              disabled={saveLoading || isSaved}
              onClick={async () => {
                setSaveLoading(true);
                setSaveError(null);
                const {
                  data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                  setSaveLoading(false);
                  window.location.href = "/login";
                  return;
                }
                const { error } = await supabase
                  .from("saved_agents")
                  .upsert({ buyer_id: user.id, agent_id: agent.id }, { onConflict: "buyer_id,agent_id" });
                if (error) {
                  setSaveError(error.message);
                } else {
                  setIsSaved(true);
                }
                setSaveLoading(false);
              }}
            >
              <Heart size={14} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
          {saveError ? <p className="text-caption text-destructive">{saveError}</p> : null}
        </div>
      </Card>

      <EnquiryModal agent={agent} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function EnquiryModal({
  agent,
  isOpen,
  onClose,
}: {
  agent: AgentRow;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [payload, setPayload] = useState<EnquiryPayload>({
    buyer_name: "",
    buyer_email: "",
    buyer_phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError(null);
    setSuccess(false);

    if (!payload.buyer_name.trim() || !payload.buyer_email.trim() || !payload.message.trim()) {
      setError("Name, email, and message are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agent.id,
          ...payload,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to submit enquiry.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Unable to submit enquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enquire with ${agent.name}`}>
      <div className="space-y-3">
        <Input
          label="Your Name"
          value={payload.buyer_name}
          onChange={(event) => setPayload((prev) => ({ ...prev, buyer_name: event.target.value }))}
        />
        <Input
          label="Email"
          type="email"
          value={payload.buyer_email}
          onChange={(event) => setPayload((prev) => ({ ...prev, buyer_email: event.target.value }))}
        />
        <Input
          label="Phone (optional)"
          value={payload.buyer_phone}
          onChange={(event) => setPayload((prev) => ({ ...prev, buyer_phone: event.target.value }))}
        />
        <Textarea
          label="Message"
          value={payload.message}
          onChange={(event) => setPayload((prev) => ({ ...prev, message: event.target.value }))}
        />

        {error ? <p className="text-caption text-destructive">{error}</p> : null}
        {success ? <p className="text-caption text-success">Enquiry submitted successfully.</p> : null}

        <Button fullWidth loading={loading} onClick={submit}>
          Send Enquiry
        </Button>
      </div>
    </Modal>
  );
}
