"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="absolute inset-0" aria-hidden onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Modal"}
        className={cn("relative z-10 w-full max-w-lg rounded-lg border border-border bg-surface p-5", className)}
      >
        <div className="mb-4 flex items-center justify-between">
          {title ? <h2 className="text-subheading text-text-primary">{title}</h2> : <span />}
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
