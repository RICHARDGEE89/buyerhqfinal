import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = { label: string; value: string };

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  label,
  helperText,
  error,
  options,
  className,
  id,
  placeholder,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div className="w-full space-y-1">
      {label ? (
        <label htmlFor={selectId} className="font-mono text-label uppercase text-text-secondary">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          className={cn(
            "w-full appearance-none rounded-md border bg-surface-2 px-3 py-2 pr-10 text-body text-text-primary focus-visible:outline-none focus-visible:ring-1",
            error
              ? "border-destructive/70 ring-destructive/40"
              : "border-border focus-visible:border-border-light focus-visible:ring-border-light",
            className
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>

      {error ? <p className="text-caption text-destructive">{error}</p> : null}
      {!error && helperText ? <p className="text-caption text-text-muted">{helperText}</p> : null}
    </div>
  );
}
