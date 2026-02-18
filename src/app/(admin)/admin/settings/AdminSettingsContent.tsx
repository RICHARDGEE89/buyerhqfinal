"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import type { Json } from "@/lib/database.types";
import { fetchAdminPanelData, runAdminAction } from "@/lib/admin-api";

type AdminPreferences = {
  notification_email: string;
  default_agent_active: boolean;
  auto_resolve_contacts: boolean;
  show_unverified_preview: boolean;
  buyer_dashboard_beta: boolean;
};

const defaultPreferences: AdminPreferences = {
  notification_email: "",
  default_agent_active: true,
  auto_resolve_contacts: false,
  show_unverified_preview: false,
  buyer_dashboard_beta: false,
};

export default function AdminSettingsContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [schemaFallback, setSchemaFallback] = useState(false);
  const [preferences, setPreferences] = useState<AdminPreferences>(defaultPreferences);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = await fetchAdminPanelData();
      const fallbackEmail = payload.adminAccount?.email ?? "ops@buyerhq.com.au";
      setAdminEmail(fallbackEmail);
      setSchemaFallback(Boolean(payload.schemaFallback));
      setPreferences(parsePreferences(payload.adminAccount?.preferences ?? null, fallbackEmail));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!adminEmail) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await runAdminAction({
        type: "update_admin_preferences",
        preferences: preferences as Json,
      });
      setSuccess("Settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    }
    setSaving(false);
  };

  const resolveAllContacts = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await runAdminAction({ type: "resolve_all_contacts" });
      setSuccess("All contact submissions marked as resolved.");
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Unable to resolve contacts.");
    }
    setSaving(false);
  };

  const setPreference = <K extends keyof AdminPreferences>(key: K, value: AdminPreferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Admin settings</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Configure moderation defaults and operational preferences for your admin account.
        </p>
        {schemaFallback ? (
          <p className="mt-2 text-caption text-text-muted">
            Preferences column not available in current schema. Using compatibility mode.
          </p>
        ) : null}
      </section>

      {error ? <ErrorState description={error} onRetry={loadSettings} /> : null}

      {loading ? (
        <Card className="space-y-3 p-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ) : null}

      {!loading ? (
        <>
          <Card className="space-y-4 p-4">
            <h2 className="text-subheading">Account preferences</h2>
            <Input
              label="Notification email"
              value={preferences.notification_email}
              onChange={(event) => setPreference("notification_email", event.target.value)}
              placeholder="ops@buyerhq.com.au"
            />

            <div className="grid gap-2">
              <Checkbox
                checked={preferences.default_agent_active}
                onChange={(checked) => setPreference("default_agent_active", checked)}
                label="Default new agent profiles to active"
              />
              <Checkbox
                checked={preferences.auto_resolve_contacts}
                onChange={(checked) => setPreference("auto_resolve_contacts", checked)}
                label="Auto-resolve contact submissions after review"
              />
              <Checkbox
                checked={preferences.show_unverified_preview}
                onChange={(checked) => setPreference("show_unverified_preview", checked)}
                label="Show unverified agents in internal previews"
              />
              <Checkbox
                checked={preferences.buyer_dashboard_beta}
                onChange={(checked) => setPreference("buyer_dashboard_beta", checked)}
                label="Enable buyer dashboard beta features"
              />
            </div>

            <Button loading={saving} onClick={saveSettings} disabled={saving}>
              Save settings
            </Button>
          </Card>

          <Card className="space-y-3 p-4">
            <h2 className="text-subheading">Maintenance actions</h2>
            <p className="text-body-sm text-text-secondary">
              Operational controls for fast moderation tasks.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" loading={saving} disabled={saving} onClick={resolveAllContacts}>
                Resolve all contact submissions
              </Button>
            </div>
          </Card>

          {success ? (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-body-sm text-success">
              {success}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function parsePreferences(input: Json | null, fallbackEmail: string): AdminPreferences {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ...defaultPreferences, notification_email: fallbackEmail };
  }

  const source = input as Record<string, Json | undefined>;

  return {
    notification_email:
      typeof source.notification_email === "string" && source.notification_email.trim()
        ? source.notification_email
        : fallbackEmail,
    default_agent_active: source.default_agent_active !== false,
    auto_resolve_contacts: source.auto_resolve_contacts === true,
    show_unverified_preview: source.show_unverified_preview === true,
    buyer_dashboard_beta: source.buyer_dashboard_beta === true,
  };
}
