import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-1 font-mono text-caption uppercase tracking-wide",
  {
    variants: {
      variant: {
        verified: "border-success/30 bg-success/10 text-success",
        state: "border-border-light bg-surface-3 text-text-secondary",
        specialization: "border-border-light bg-surface-2 text-text-secondary",
        category: "border-border-light bg-transparent text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "state",
    },
  }
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "verified" ? <CheckCircle2 size={12} aria-hidden /> : null}
      {children}
    </span>
  );
}
