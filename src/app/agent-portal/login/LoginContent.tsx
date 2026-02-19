"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/agent-portal";
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResetMessage(null);
    setLoading(true);

    const result = await signIn({ email, password });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.replace(next);
    router.refresh();
  };

  const onForgotPassword = async () => {
    setError(null);
    setResetMessage(null);

    if (!email.trim()) {
      setError("Enter your email first, then use forgot password.");
      return;
    }

    const result = await resetPassword(email);
    if (result.error) {
      setError(result.error);
    } else {
      setResetMessage("Password reset email sent. Check your inbox.");
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-heading text-text-primary">Agent Portal Login</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Sign in to update your profile and respond to BuyerHQ admin requests.
        </p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="text-caption text-destructive">{error}</p> : null}
          {resetMessage ? <p className="text-caption text-success">{resetMessage}</p> : null}

          <Button type="submit" loading={loading} disabled={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-caption">
          <button type="button" onClick={onForgotPassword} className="text-text-secondary hover:text-text-primary">
            Forgot password?
          </button>
          <Link href="/list-agency" className="text-text-secondary hover:text-text-primary">
            Create Agent Profile
          </Link>
        </div>
      </Card>
    </div>
  );
}
