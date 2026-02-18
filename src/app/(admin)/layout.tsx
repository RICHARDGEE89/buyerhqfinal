"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/bulk-upload", label: "Bulk Upload" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/logs", label: "Logs" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute requireAdmin>
      <div className="container py-8">
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
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
        </div>
        {children}
      </div>
    </ProtectedRoute>
  );
}
