"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/saved", label: "Saved Agents" },
  { href: "/dashboard/enquiries", label: "Enquiries" },
];

export function BuyerPortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md border px-3 py-2 text-body-sm text-text-secondary transition-colors",
                pathname === link.href
                  ? "border-border-light bg-surface-2 text-text-primary"
                  : "border-border hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button
          variant="secondary"
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          Sign Out
        </Button>
      </div>
      {children}
    </div>
  );
}
