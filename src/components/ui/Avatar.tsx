import Image from "next/image";

import { cn } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimension = size === "sm" ? 36 : size === "lg" ? 72 : 48;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-full border border-border bg-surface-3 font-mono text-caption text-text-secondary",
        className
      )}
      style={{ width: dimension, height: dimension }}
      aria-label={`${name} avatar`}
    >
      {src ? (
        <Image src={src} alt={`${name} profile photo`} width={dimension} height={dimension} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
