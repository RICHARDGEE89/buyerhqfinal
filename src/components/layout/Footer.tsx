import Link from "next/link";

const footerLinks = {
  buyer: [
    { name: "Find Agents", href: "/agents" },
    { name: "Match Quiz", href: "/quiz" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Buyer Sign Up", href: "/signup" },
    { name: "Buyer Login", href: "/login" },
    { name: "Blog", href: "/blog" },
  ],
  roles: [
    { name: "Buyer Login", href: "/login" },
    { name: "Agent Login", href: "/agent-portal/login" },
    { name: "Admin Login", href: "/admin-login" },
  ],
  support: [
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="font-mono text-heading font-semibold text-text-primary">
              BuyerHQ
            </Link>
            <p className="max-w-xs text-body-sm text-text-secondary">
              Australia&apos;s verified buyer&apos;s agent directory. Client-focused and brokered by BuyerHQ
              from request to introduction.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/signup" className="rounded-md bg-accent px-3 py-2 text-caption font-semibold text-text-inverse">
                Buyer Sign Up
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-border px-3 py-2 text-caption text-text-secondary transition-colors hover:text-text-primary"
              >
                Buyer Login
              </Link>
            </div>
          </div>

          <FooterColumn title="Buyer Journey" links={footerLinks.buyer} />
          <FooterColumn title="Role Login" links={footerLinks.roles} />
          <FooterColumn title="Support" links={footerLinks.support} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-caption text-text-muted">
            © {new Date().getFullYear()} BuyerHQ. All rights reserved.
          </p>
          <span className="inline-flex w-fit items-center rounded-full border border-border-light px-3 py-1 font-mono text-caption text-text-secondary">
            Built in Australia
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ name: string; href: string }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-label uppercase text-text-secondary">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-body-sm text-text-secondary transition-colors hover:text-text-primary">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
