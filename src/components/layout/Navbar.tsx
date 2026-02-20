"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Home, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  description: string;
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    id: "agents",
    label: "Agents",
    items: [
      { label: "Find Agents", href: "/find-agents", description: "Search verified specialists" },
      { label: "Match Quiz", href: "/match-quiz", description: "Get a personalised shortlist" },
    ],
  },
  {
    id: "suburbs",
    label: "Suburbs",
    items: [
      { label: "Suburb Directory", href: "/suburbs", description: "Browse suburb coverage" },
      { label: "Suburb Profile", href: "/suburb/sydney", description: "View suburb-specific pages" },
    ],
  },
  {
    id: "journey",
    label: "Journey",
    items: [
      { label: "Buyer Journey", href: "/journey", description: "Track progress and milestones" },
      { label: "Buyer DNA", href: "/buyer-profile", description: "Profile and readiness" },
      { label: "Calculator Tools", href: "/tools", description: "Budget and strategy tools" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { label: "How It Works", href: "/how-it-works", description: "BuyerHQ process" },
      { label: "FAQ", href: "/faq", description: "Common buyer questions" },
      { label: "About", href: "/about", description: "Our mission and standards" },
      { label: "Blog", href: "/blog", description: "Buying insights" },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const activeGroup = useMemo(
    () =>
      navGroups.find((group) =>
        group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      )?.id ?? null,
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-navy shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white/15">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Buyer<span className="text-white/50">HQ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {navGroups.map((group) => {
            const isOpen = activeDropdown === group.id;
            const isActive = activeGroup === group.id;
            return (
              <div
                key={group.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(group.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-white underline underline-offset-4 decoration-white/40"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {group.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[260px] rounded-xl border border-white/10 bg-navy px-3 py-3 shadow-2xl">
                    {group.items.map((item) => {
                      const itemActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "mb-1 flex flex-col rounded-lg px-3 py-2.5 transition-colors last:mb-0",
                            itemActive
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/8 hover:text-white"
                          )}
                        >
                          <span className="text-sm font-medium leading-tight">{item.label}</span>
                          <span className="mt-0.5 text-xs leading-tight text-white/45">{item.description}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/match-quiz"
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
          >
            Get Matched Free
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Login
          </Link>
        </div>

        <button
          className="p-1 text-white md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/10 bg-navy px-4 pb-4 pt-2 md:hidden">
          {navGroups.map((group) => (
            <div key={group.id} className="border-b border-white/8 py-2 last:border-0">
              <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">{group.label}</p>
              {group.items.map((item) => {
                const itemActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "mb-1 block rounded-lg px-3 py-2 text-sm transition-colors last:mb-0",
                      itemActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/match-quiz"
              onClick={() => setMobileOpen(false)}
              className="rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-navy"
            >
              Match Quiz
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="rounded-md border border-white/20 px-3 py-2 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
