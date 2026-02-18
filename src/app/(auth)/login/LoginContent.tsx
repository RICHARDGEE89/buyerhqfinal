"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const adminAllowList = new Set(["richardgoodwin@live.com", "cam.dirtymack@gmail.com"]);

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
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    const userEmail = data.user.email?.toLowerCase() ?? "";

    if (adminAllowList.has(userEmail)) {
      router.push(resolveNextPath("/admin"));
      router.refresh();
      return;
    }

    const { data: profile } = await supabase
      .from("agent_profiles")
      .select("agent_id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.agent_id) {
      router.push(resolveNextPath("/agent-portal"));
      router.refresh();
      return;
    }

    router.push(resolveNextPath("/dashboard"));
    router.refresh();
  };

  return (
    <div className="container max-w-xl py-16">
      <Card className="space-y-6 p-6">
        <div>
          <h1 className="text-heading">Sign in</h1>
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
