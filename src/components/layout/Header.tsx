"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/agents", label: "Find Agents" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-md transition-all",
        scrolled && "shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tight text-text-primary">
          BuyerHQ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary",
                  active && "text-text-primary underline decoration-border-light underline-offset-8"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/signup"
            className="rounded-md bg-accent px-4 py-2 text-body-sm font-semibold text-text-inverse transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-border px-4 py-2 text-body-sm font-medium text-text-primary transition-colors hover:border-border-light hover:bg-surface-2"
          >
            Sign In
          </Link>
        </div>
        <div className="ml-4 hidden items-center gap-2 text-caption text-text-muted lg:flex">
          <span className="font-mono uppercase">Role login</span>
          <Link href="/login" className="hover:text-text-primary">
            Buyer
          </Link>
          <span>·</span>
          <Link href="/agent-portal/login" className="hover:text-text-primary">
            Agent
          </Link>
          <span>·</span>
          <Link href="/admin-login" className="hover:text-text-primary">
            Admin
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-primary md:hidden"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background transition-transform duration-300 md:hidden",
          menuOpen ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container flex h-full flex-col pt-24">
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <span className="font-mono text-lg font-semibold">BuyerHQ</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md border border-transparent px-4 py-3 text-subheading text-text-secondary",
                  pathname === link.href && "border-border text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto grid gap-3 pb-8 pt-8">
            <Link
              href="/signup"
              className="rounded-md bg-accent px-4 py-3 text-center text-body font-semibold text-text-inverse"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-border px-4 py-3 text-center text-body font-medium"
            >
              Sign In
            </Link>
            <div className="rounded-md border border-border bg-surface p-3 text-center text-caption text-text-secondary">
              <p className="mb-1 font-mono uppercase text-text-muted">Role login</p>
              <div className="flex items-center justify-center gap-2">
                <Link href="/login" className="hover:text-text-primary">
                  Buyer
                </Link>
                <span>·</span>
                <Link href="/agent-portal/login" className="hover:text-text-primary">
                  Agent
                </Link>
                <span>·</span>
                <Link href="/admin-login" className="hover:text-text-primary">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
