"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";

type BuyerProfileForm = {
  first_name: string;
  last_name: string;
  phone: string;
  preferred_state: string;
  budget_range: string;
  goals: string;
};

const stateOptions = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function ProfileContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState<BuyerProfileForm>({
    first_name: "",
    last_name: "",
    phone: "",
    preferred_state: "",
    budget_range: "",
    goals: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email ?? "");
    const meta = user.user_metadata ?? {};
    setForm({
      first_name: toText(meta.first_name),
      last_name: toText(meta.last_name),
      phone: toText(meta.phone),
      preferred_state: toText(meta.preferred_state).toUpperCase(),
      budget_range: toText(meta.budget_range),
      goals: toText(meta.goals),
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const setField = <K extends keyof BuyerProfileForm>(field: K, value: BuyerProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        preferred_state: form.preferred_state.trim(),
        budget_range: form.budget_range.trim(),
        goals: form.goals.trim(),
      },
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Buyer profile updated.");
    }

    setSaving(false);
  };

  const completionFields = [form.first_name, form.last_name, form.phone, form.preferred_state, form.budget_range, form.goals];
  const completionPct = Math.round(
    (completionFields.filter((value) => value.trim().length > 0).length / completionFields.length) * 100
  );

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (error && !email) {
    return <ErrorState description={error} onRetry={loadProfile} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Buyer profile</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Keep your preferences current to improve agent matching and response quality.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4 p-4">
          <h2 className="text-subheading">Profile details</h2>
          <p className="text-caption text-text-secondary">Account email: {email}</p>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="First name"
              value={form.first_name}
              onChange={(event) => setField("first_name", event.target.value)}
            />
            <Input
              label="Last name"
              value={form.last_name}
              onChange={(event) => setField("last_name", event.target.value)}
            />
            <Input label="Phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
            <Select
              label="Preferred state"
              value={form.preferred_state}
              onChange={(event) => setField("preferred_state", event.target.value)}
              placeholder="Select state"
              options={stateOptions.map((state) => ({ value: state, label: state }))}
            />
          </div>

          <Input
            label="Budget range"
            value={form.budget_range}
            onChange={(event) => setField("budget_range", event.target.value)}
            placeholder="e.g. $1M - $1.5M"
          />

          <Textarea
            label="Buying goals"
            value={form.goals}
            onChange={(event) => setField("goals", event.target.value)}
            placeholder="Share suburb goals, property type, and timeline."
          />

          <div className="flex items-center gap-2">
            <Button loading={saving} disabled={saving} onClick={saveProfile}>
              Save profile
            </Button>
            <Button variant="secondary" disabled={saving} onClick={loadProfile}>
              Reset
            </Button>
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Completion</h2>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full bg-accent transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="text-caption text-text-secondary">{completionPct}% complete</p>
          <p className="text-caption text-text-muted">
            Completing your profile helps agents respond with more relevant advice.
          </p>
        </Card>
      </section>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-body-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success">
          {success}
        </p>
      ) : null}
    </div>
  );
}

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}
