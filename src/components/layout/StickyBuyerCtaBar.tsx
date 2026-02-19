"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const hiddenPrefixes = ["/admin", "/buyer", "/agent-portal", "/list-agency"];
const hiddenPaths = new Set(["/login", "/signup", "/admin-login"]);

export function StickyBuyerCtaBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const shouldRender = useMemo(() => {
    if (!pathname) return false;
    if (hiddenPaths.has(pathname)) return false;
    return !hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));
  }, [pathname]);

  useEffect(() => {
    if (!shouldRender) {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-xl border border-border bg-surface/95 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur">
        <p className="hidden text-body-sm text-text-secondary sm:block">
          Verified review intelligence and negotiated fee outcomes in one place.
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" asChild>
            <Link href="/agents">Find Agents</Link>
          </Button>
          <Button size="sm" variant="secondary" asChild>
            <Link href="/quiz">Take Quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
