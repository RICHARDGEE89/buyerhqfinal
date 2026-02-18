"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { resolveAgentProfileForUser } from "@/lib/agent-profile";
import type { AgentProfileRow, Json } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type AgentPreferences = {
  notification_email: string;
  instant_lead_alerts: boolean;
  weekly_summary: boolean;
  timezone: string;
  public_phone_visible: boolean;
};

const defaultPreferences: AgentPreferences = {
  notification_email: "",
  instant_lead_alerts: true,
  weekly_summary: true,
  timezone: "Australia/Sydney",
  public_phone_visible: true,
};

export default function SettingsContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<AgentProfileRow | null>(null);
  const [preferences, setPreferences] = useState<AgentPreferences>(defaultPreferences);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !user.email) {
      setError(userError?.message ?? "Unable to load user session.");
      setLoading(false);
      return;
    }

    setEmail(user.email);

    const { agentId, error: profileResolveError } = await resolveAgentProfileForUser(supabase, user);
    if (profileResolveError) {
      setError(profileResolveError);
      setLoading(false);
      return;
    }
    if (!agentId) {
      setError("Unable to load agent settings.");
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profileData) {
      setError(profileError?.message ?? "Unable to load agent settings.");
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setPreferences(parseAgentPreferences(profileData.preferences, user.email));
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const setPreference = <K extends keyof AgentPreferences>(key: K, value: AgentPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const savePreferences = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase
      .from("agent_profiles")
      .update({ preferences: preferences as Json })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Agent settings saved.");
      setProfile((current) => (current ? { ...current, preferences: preferences as Json } : current));
    }
    setSaving(false);
  };

  const sendPasswordReset = async () => {
    if (!email) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/agent-portal/login`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("Password reset link sent.");
    }
    setSaving(false);
  };

  const signOutEverywhere = async () => {
    setSaving(true);
    await supabase.auth.signOut({ scope: "global" });
    window.location.href = "/agent-portal/login";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return <ErrorState description={error} onRetry={loadSettings} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Agent account settings</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Manage notification preferences, communication defaults, and account security.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4 p-4">
          <h2 className="text-subheading">Notifications</h2>
          <Input
            label="Notification email"
            value={preferences.notification_email}
            onChange={(event) => setPreference("notification_email", event.target.value)}
            placeholder={email}
          />
          <Select
            label="Timezone"
            value={preferences.timezone}
            onChange={(event) => setPreference("timezone", event.target.value)}
            options={[
              { value: "Australia/Sydney", label: "Australia/Sydney" },
              { value: "Australia/Melbourne", label: "Australia/Melbourne" },
              { value: "Australia/Brisbane", label: "Australia/Brisbane" },
              { value: "Australia/Perth", label: "Australia/Perth" },
            ]}
          />
          <div className="grid gap-2">
            <Checkbox
              checked={preferences.instant_lead_alerts}
              onChange={(checked) => setPreference("instant_lead_alerts", checked)}
              label="Instant lead alerts"
            />
            <Checkbox
              checked={preferences.weekly_summary}
              onChange={(checked) => setPreference("weekly_summary", checked)}
              label="Weekly pipeline summary"
            />
            <Checkbox
              checked={preferences.public_phone_visible}
              onChange={(checked) => setPreference("public_phone_visible", checked)}
              label="Show phone number on public profile"
            />
          </div>
          <Button loading={saving} disabled={saving} onClick={savePreferences}>
            Save settings
          </Button>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Security</h2>
          <p className="text-body-sm text-text-secondary">Signed in as {email}</p>
          <Button variant="secondary" loading={saving} disabled={saving} onClick={sendPasswordReset}>
            Send password reset email
          </Button>
          <Button variant="destructive" loading={saving} disabled={saving} onClick={signOutEverywhere}>
            Sign out all sessions
          </Button>
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

function parseAgentPreferences(input: Json | null, fallbackEmail: string): AgentPreferences {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ...defaultPreferences, notification_email: fallbackEmail };
  }

  const source = input as Record<string, Json | undefined>;

  return {
    notification_email:
      typeof source.notification_email === "string" && source.notification_email.trim()
        ? source.notification_email
        : fallbackEmail,
    instant_lead_alerts: source.instant_lead_alerts !== false,
    weekly_summary: source.weekly_summary !== false,
    timezone: typeof source.timezone === "string" && source.timezone ? source.timezone : "Australia/Sydney",
    public_phone_visible: source.public_phone_visible !== false,
  };
}
