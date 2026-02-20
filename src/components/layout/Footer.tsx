import Link from "next/link";
import { Home, Mail } from "lucide-react";

const footerLinks = {
  "Buyer Journey": [
    { label: "Find Agents", href: "/find-agents" },
    { label: "Take Match Quiz", href: "/match-quiz" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Property Journey", href: "/journey" },
    { label: "Buyer DNA Profile", href: "/buyer-profile" },
  ],
  "Tools & Resources": [
    { label: "Calculator Suite", href: "/tools" },
    { label: "Suburb Directory", href: "/suburbs" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
    { label: "About BuyerHQ", href: "/about" },
  ],
  Support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Buyer Login", href: "/login" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/15">
                <Home className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Buyer<span className="text-white/45">HQ</span>
              </span>
            </div>
            <p className="max-w-[240px] text-sm leading-relaxed text-white/55">
              Verified review intelligence and negotiated fee outcomes in one place.
            </p>
            <div className="space-y-2 text-sm text-white/55">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-white/40" />
                <span>hello@buyerhq.com.au</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-white/50">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/55 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/35 md:flex-row">
          <span>© {new Date().getFullYear()} BuyerHQ Pty Ltd. All rights reserved.</span>
          <span>Australian Property Advisory Platform</span>
        </div>
      </div>
    </footer>
  );
}
