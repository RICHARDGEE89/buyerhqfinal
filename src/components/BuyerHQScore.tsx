import type { AgentRow } from "@/lib/database.types";
import { computeBuyerHQScore, scoreLabel } from "@/lib/public-agent";
import { cn } from "@/lib/utils";

type BuyerHQScoreProps = {
  agent: AgentRow;
  size?: "sm" | "md" | "lg";
};

function scoreColor(score: number) {
  if (score >= 90) return "text-foreground bg-foreground/10 border-foreground/25";
  if (score >= 75) return "text-foreground bg-muted border-border";
  return "text-muted-foreground bg-muted border-border";
}

export function BuyerHQScore({ agent, size = "sm" }: BuyerHQScoreProps) {
  const score = computeBuyerHQScore(agent);
  const colorClass = scoreColor(score);

  if (size === "sm") {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", colorClass)}>
        <span className="font-bold">{score}</span>
        <span className="opacity-70">{scoreLabel(score)}</span>
      </span>
    );
  }

  if (size === "md") {
    return (
      <div className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-1.5", colorClass)}>
        <div className="text-center">
          <div className="text-xl font-bold leading-none">{score}</div>
          <div className="mt-0.5 text-[10px] leading-none opacity-60">/ 100</div>
        </div>
        <div>
          <div className="text-xs font-semibold leading-none">BuyerHQ Score</div>
          <div className="mt-0.5 text-[10px] leading-none opacity-60">{scoreLabel(score)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border p-4 text-center", colorClass)}>
      <div className="font-display text-3xl font-bold leading-none">{score}</div>
      <div className="mt-1 text-xs font-semibold">BuyerHQ Score</div>
      <div className="mt-0.5 text-[11px] opacity-60">{scoreLabel(score)}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
        <div className="h-full rounded-full bg-current" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
