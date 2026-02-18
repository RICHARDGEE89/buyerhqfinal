import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({
  value,
  reviewCount,
  className,
}: {
  value: number | null | undefined;
  reviewCount?: number | null;
  className?: string;
}) {
  const safeValue = value ?? 0;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const active = i < Math.round(safeValue);
          return (
            <Star
              key={i}
              size={14}
              className={cn(active ? "fill-accent text-accent" : "fill-transparent text-border-light")}
            />
          );
        })}
      </div>
      <span className="font-mono text-caption text-text-secondary">
        {safeValue.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
