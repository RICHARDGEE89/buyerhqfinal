import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export function Input({ label, helperText, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full space-y-1">
      {label ? (
        <label htmlFor={inputId} className="font-mono text-label uppercase text-text-secondary">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border bg-surface-2 px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-1",
          error
            ? "border-destructive/70 ring-destructive/40"
            : "border-border focus-visible:border-border-light focus-visible:ring-border-light",
          className
        )}
        {...props}
      />

      {error ? <p className="text-caption text-destructive">{error}</p> : null}
      {!error && helperText ? <p className="text-caption text-text-muted">{helperText}</p> : null}
    </div>
  );
}
