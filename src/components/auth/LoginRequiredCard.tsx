"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type LoginRequiredCardProps = {
  title: string;
  description: string;
  nextPath: string;
};

export function LoginRequiredCard({ title, description, nextPath }: LoginRequiredCardProps) {
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <Card className="space-y-3 border-border-light p-5">
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 font-mono text-caption uppercase text-text-secondary">
        <Lock size={12} />
        Login required
      </div>
      <h2 className="text-subheading">{title}</h2>
      <p className="text-body-sm text-text-secondary">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={loginHref}>
            Sign in to continue <ArrowRight size={14} />
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link href="/signup">Create buyer account</Link>
        </Button>
      </div>
    </Card>
  );
}
