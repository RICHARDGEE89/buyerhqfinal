"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { resolveAgentProfileForUser } from "@/lib/agent-profile";
import { createClient } from "@/lib/supabase/client";

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginContent({ nextPath }: { nextPath: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveNextPath = (fallbackPath: string) => {
    if (!nextPath) return fallbackPath;
    if (!nextPath.startsWith("/")) return fallbackPath;
    if (nextPath.startsWith("//")) return fallbackPath;
    return nextPath;
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter both email and password.");
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (authError || !data.user) {
      setError(mapAuthErrorMessage(authError?.message ?? "Unable to sign in."));
      setLoading(false);
      return;
    }

    const userEmail = data.user.email?.toLowerCase() ?? "";

    if (adminAllowList.has(userEmail)) {
      setLoading(false);
      router.push(resolveNextPath("/admin"));
      router.refresh();
      return;
    }

    const { agentId, error: agentProfileError } = await resolveAgentProfileForUser(supabase, data.user);
    if (agentProfileError) {
      setError(agentProfileError);
      setLoading(false);
      return;
    }

    if (agentId) {
      setLoading(false);
      router.push(resolveNextPath("/agent-portal"));
      router.refresh();
      return;
    }

    router.push(resolveNextPath("/dashboard"));
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="container grid gap-6 py-12 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <p className="font-mono text-label uppercase text-text-secondary">Welcome Back</p>
        <h1 className="mt-3 text-display text-text-primary">Sign in to BuyerHQ</h1>
        <p className="mt-3 max-w-xl text-body text-text-secondary">
          Access buyer dashboards, agent workspaces, and admin controls from one secure login flow.
        </p>
        <div className="mt-6 grid gap-2 text-body-sm text-text-secondary">
          <p>• Buyer accounts go to dashboard</p>
          <p>• Agent accounts go to agent portal</p>
          <p>• Approved admin accounts go to admin console</p>
        </div>
      </section>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-heading">Sign in</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Access your buyer dashboard, agent portal, or admin console.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleLogin}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="submit" loading={loading} disabled={loading} fullWidth>
            Sign in
          </Button>
        </form>

        <p className="text-body-sm text-text-secondary">
          New to BuyerHQ?{" "}
          <Link href="/signup" className="text-text-primary underline">
            Create an account
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
