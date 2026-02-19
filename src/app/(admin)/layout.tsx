"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/bulk-upload", label: "Bulk Upload" },
  { href: "/admin/review-sources", label: "Review Sources" },
  { href: "/admin/broker-console", label: "Broker Console" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <ProtectedRoute requireAdmin>
      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-24">
            <p className="font-mono text-label uppercase text-text-secondary">BuyerHQ Ops</p>
            <h2 className="mt-2 text-subheading">Admin Console</h2>
            <p className="mt-1 text-body-sm text-text-secondary">
              Moderation, user controls, and platform operations.
            </p>

            <nav className="mt-4 grid gap-2">
              {adminLinks.map((link) => (
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
            </nav>
            <Button
              className="mt-4"
              variant="secondary"
              fullWidth
              onClick={async () => {
                await signOut();
                window.location.href = "/login?next=/admin";
              }}
            >
              Sign Out
            </Button>
          </aside>

          <div>{children}</div>
        </div>
      </div>
      <div className="container pb-2 lg:hidden">
        <div className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link
              key={`mobile-${link.href}`}
              href={link.href}
              className={cn(
                "rounded-md border px-3 py-2 text-caption text-text-secondary transition-colors",
                pathname === link.href
                  ? "border-border-light bg-surface-2 text-text-primary"
                  : "border-border hover:text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await signOut();
              window.location.href = "/login?next=/admin";
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
