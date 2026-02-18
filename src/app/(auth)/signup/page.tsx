"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import { mapAuthErrorMessage } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setNeedsEmailConfirmation(false);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (!emailPattern.test(email.trim().toLowerCase())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the terms to continue.");
      return;
    }

    setLoading(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: buildAuthCallbackUrl("/dashboard"),
        data: {
          role: "buyer",
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (signupError) {
      if (/already registered/i.test(signupError.message)) {
        setError("This email already has an account. Sign in instead.");
      } else {
        setError(mapAuthErrorMessage(signupError.message));
      }
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setNeedsEmailConfirmation(true);
    setSuccess("Account created. Check your email to confirm your account before signing in.");
    setLoading(false);
  };

  return (
    <div className="container grid gap-6 py-12 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <p className="font-mono text-label uppercase text-text-secondary">BuyerHQ Access</p>
        <h1 className="mt-3 text-display text-text-primary">Create your buyer account</h1>
        <p className="mt-3 max-w-xl text-body text-text-secondary">
          Save agents, compare specialists side by side, and track every enquiry from one dashboard.
        </p>

        <div className="mt-6 grid gap-2">
          {[
            "Instant agent shortlist tools",
            "Saved agent comparisons and notes",
            "Enquiry history with response tracking",
          ].map((item) => (
            <p key={item} className="inline-flex items-center gap-2 text-body-sm text-text-secondary">
              <CheckCircle2 size={14} className="text-success" />
              {item}
            </p>
          ))}
        </div>
      </section>

      <Card className="space-y-6 p-6">
        <div>
          <h2 className="text-heading">Sign up</h2>
          <p className="mt-2 text-body-sm text-text-secondary">
            Use your email and a strong password to create your buyer account.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSignup}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
            <Input
              label="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>
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
          <Input
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <label className="flex items-start gap-2 rounded-md border border-border bg-surface-2 px-3 py-2 text-body-sm text-text-secondary">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              className="mt-1 accent-white"
            />
            <span>
              I agree to BuyerHQ terms and acknowledge this account is for buyer dashboard use.
            </span>
          </label>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-caption text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-caption text-success">
              {success}
            </p>
          ) : null}

          <Button type="submit" loading={loading} disabled={loading} fullWidth>
            Create account
          </Button>

          {needsEmailConfirmation ? (
            <Button type="button" variant="secondary" fullWidth onClick={() => router.push("/login")}>
              Continue to sign in
            </Button>
          ) : null}
        </form>

        <p className="text-body-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-text-primary underline">
            Sign in
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
