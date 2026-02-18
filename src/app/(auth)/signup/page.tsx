"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

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

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("All fields are required.");
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

    setLoading(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          role: "buyer",
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess("Account created. Check your email to confirm your account before signing in.");
    setLoading(false);
  };

  return (
    <div className="container max-w-xl py-16">
      <Card className="space-y-6 p-6">
        <div>
          <h1 className="text-heading">Create your account</h1>
          <p className="mt-2 text-body-sm text-text-secondary">
            Create a buyer account to save agents, send enquiries, and track progress.
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
