"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Checkbox({
  checked,
  onChange,
  label,
  className,
  id,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-body-sm text-text-secondary",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 items-center justify-center rounded-sm border transition-colors",
          checked
            ? "border-accent bg-accent text-text-inverse"
            : "border-border-light bg-surface-2 text-transparent"
        )}
      >
        <Check size={12} />
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
