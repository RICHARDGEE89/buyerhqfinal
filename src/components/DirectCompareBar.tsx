"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Scale, Star, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { PublicAgentView } from "@/lib/public-agent";

type DirectCompareBarProps = {
  agents: PublicAgentView[];
  onRemove: (id: string) => void;
  onClose: () => void;
};

function CompareModal({
  agents,
  onClose,
  onRemove,
}: {
  agents: PublicAgentView[];
  onClose: () => void;
  onRemove: (id: string) => void;
}) {
  const rows = useMemo(
    () => [
      { label: "Rating", value: (agent: PublicAgentView) => `${agent.rating.toFixed(1)} (${agent.reviewCount})` },
      { label: "State", value: (agent: PublicAgentView) => agent.state },
      { label: "Experience", value: (agent: PublicAgentView) => `${agent.yearsExperience} years` },
      { label: "Fee structure", value: (agent: PublicAgentView) => agent.feeStructure },
      {
        label: "Minimum fee",
        value: (agent: PublicAgentView) => (agent.minFee > 0 ? `$${agent.minFee.toLocaleString()}` : "Consultation"),
      },
      { label: "Specialisations", value: (agent: PublicAgentView) => agent.specialisations.slice(0, 3).join(", ") || "—" },
    ],
    []
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-display text-lg font-bold text-navy">Agent Comparison</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-muted">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-40 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Criteria
                </th>
                {agents.map((agent) => (
                  <th key={agent.id} className="min-w-52 px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-display text-sm font-bold text-navy">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.company}</p>
                      <button
                        onClick={() => onRemove(agent.id)}
                        className="text-[10px] text-muted-foreground transition-colors hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.label} className={cn("border-b border-border/50", index % 2 === 1 && "bg-muted/20")}>
                  <td className="px-6 py-3.5 text-xs font-semibold text-muted-foreground">{row.label}</td>
                  {agents.map((agent) => (
                    <td key={`${agent.id}-${row.label}`} className="px-6 py-3.5 text-center text-sm text-foreground">
                      {row.value(agent)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border px-6 py-4">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.slug || agent.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-navy-mid"
            >
              View {agent.name.split(" ")[0]} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DirectCompareBar({ agents, onRemove, onClose }: DirectCompareBarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-foreground/20 bg-foreground text-background shadow-lg">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Scale className="h-4 w-4 opacity-70" />
            <span className="text-sm font-semibold">
              Comparing {agents.length} agent{agents.length > 1 ? "s" : ""}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {agents.map((agent) => (
                <span key={agent.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                  <Star className="h-3 w-3" />
                  {agent.name.split(" ")[0]}
                  <button onClick={() => onRemove(agent.id)} className="transition-opacity hover:opacity-60">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-white/90 disabled:opacity-50"
              onClick={() => setModalOpen(true)}
              disabled={agents.length < 2}
            >
              Compare Side-by-Side
            </button>
            <button onClick={onClose} className="p-1.5 transition-opacity hover:opacity-60">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? <CompareModal agents={agents} onClose={() => setModalOpen(false)} onRemove={onRemove} /> : null}
    </>
  );
}
