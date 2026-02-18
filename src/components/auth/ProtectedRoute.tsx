"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({
  children,
  redirectTo = "/agent-portal/login",
  requireAdmin = false,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (requireAdmin) {
      const allowed = ["richardgoodwin@live.com", "cam.dirtymack@gmail.com"];
      const email = user.email?.toLowerCase() ?? "";
      if (!allowed.includes(email)) {
        router.replace("/agent-portal");
      }
    }
  }, [loading, redirectTo, requireAdmin, router, user]);

  if (loading) {
    return (
      <div className="container py-16 text-body text-text-secondary">Checking your session...</div>
    );
  }

  if (!user) return null;

  if (requireAdmin) {
    const allowed = ["richardgoodwin@live.com", "cam.dirtymack@gmail.com"];
    const email = user.email?.toLowerCase() ?? "";
    if (!allowed.includes(email)) return null;
  }

  return <>{children}</>;
}
