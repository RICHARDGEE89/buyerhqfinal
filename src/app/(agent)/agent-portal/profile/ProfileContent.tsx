"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Textarea";
import { resolveAgentProfileForUser } from "@/lib/agent-profile";
import type { AgentProfileRow, AgentRow, Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

const states = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

type AgentFormState = {
  name: string;
  agency_name: string;
  phone: string;
  state: string;
  suburbs: string;
  specializations: string;
  years_experience: string;
  properties_purchased: string;
  fee_structure: string;
  website_url: string;
  linkedin_url: string;
  bio: string;
};

export default function ProfileContent() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentRow | null>(null);
  const [profile, setProfile] = useState<AgentProfileRow | null>(null);
  const [form, setForm] = useState<AgentFormState>({
    name: "",
    agency_name: "",
    phone: "",
    state: "",
    suburbs: "",
    specializations: "",
    years_experience: "",
    properties_purchased: "",
    fee_structure: "",
    website_url: "",
    linkedin_url: "",
    bio: "",
  });

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/agent-portal/login";
      return;
    }

    const { agentId: resolvedAgentId, error: profileResolveError } = await resolveAgentProfileForUser(
      supabase,
      user
    );

    if (profileResolveError) {
      setError(profileResolveError);
      setLoading(false);
      return;
    }
    if (!resolvedAgentId) {
      setError("No linked agent profile found.");
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase.from("agent_profiles").select("*").eq("id", user.id).maybeSingle();

    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", resolvedAgentId)
      .single();

    if (agentError || !agentData) {
      setError(agentError?.message ?? "Unable to load profile details.");
      setLoading(false);
      return;
    }

    setAgentId(agentData.id);
    setAgent(agentData);
    setProfile((profileData as AgentProfileRow | null) ?? null);
    setForm({
      name: agentData.name,
      agency_name: agentData.agency_name ?? "",
      phone: agentData.phone ?? "",
      state: agentData.state ?? "",
      suburbs: (agentData.suburbs ?? []).join(", "),
      specializations: (agentData.specializations ?? []).join(", "),
      years_experience: agentData.years_experience?.toString() ?? "",
      properties_purchased: agentData.properties_purchased?.toString() ?? "",
      fee_structure: agentData.fee_structure ?? "",
      website_url: agentData.website_url ?? "",
      linkedin_url: agentData.linkedin_url ?? "",
      bio: agentData.bio ?? "",
    });
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const setField = <K extends keyof AgentFormState>(field: K, value: AgentFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async () => {
    if (!agentId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const suburbs = form.suburbs
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const specializations = form.specializations
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const payload: Database["public"]["Tables"]["agents"]["Update"] = {
      name: form.name.trim(),
      agency_name: form.agency_name.trim() || null,
      phone: form.phone.trim() || null,
      state: form.state ? (form.state as Database["public"]["Tables"]["agents"]["Row"]["state"]) : null,
      suburbs,
      specializations,
      years_experience: form.years_experience ? Number.parseInt(form.years_experience, 10) : null,
      properties_purchased: form.properties_purchased
        ? Number.parseInt(form.properties_purchased, 10)
        : null,
      fee_structure: form.fee_structure.trim() || null,
      website_url: form.website_url.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      bio: form.bio.trim() || null,
    };

    const { data, error: updateError } = await supabase
      .from("agents")
      .update(payload)
      .eq("id", agentId)
      .select("*")
      .single();

    if (updateError || !data) {
      setError(updateError?.message ?? "Unable to save profile.");
      setSaving(false);
      return;
    }

    setAgent(data);
    setSuccess("Profile updated successfully.");
    setSaving(false);
  };

  const completionFields = [
    form.name,
    form.agency_name,
    form.phone,
    form.state,
    form.suburbs,
    form.specializations,
    form.bio,
    form.fee_structure,
    form.website_url,
  ];
  const completionPct = Math.round((completionFields.filter((value) => value.trim()).length / completionFields.length) * 100);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return <ErrorState description={error} onRetry={loadProfile} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Public profile settings</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Keep your profile current so buyers can assess your expertise and enquiry fit.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4 p-4">
          <h2 className="text-subheading">Profile details</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Full name" value={form.name} onChange={(event) => setField("name", event.target.value)} />
            <Input
              label="Agency name"
              value={form.agency_name}
              onChange={(event) => setField("agency_name", event.target.value)}
            />
            <Input label="Phone" value={form.phone} onChange={(event) => setField("phone", event.target.value)} />
            <Select
              label="State"
              value={form.state}
              onChange={(event) => setField("state", event.target.value)}
              placeholder="Select state"
              options={states.map((item) => ({ value: item, label: item }))}
            />
            <Input
              label="Years experience"
              value={form.years_experience}
              onChange={(event) => setField("years_experience", event.target.value.replace(/\D/g, ""))}
            />
            <Input
              label="Properties purchased"
              value={form.properties_purchased}
              onChange={(event) => setField("properties_purchased", event.target.value.replace(/\D/g, ""))}
            />
          </div>

          <Input
            label="Target suburbs (comma separated)"
            value={form.suburbs}
            onChange={(event) => setField("suburbs", event.target.value)}
          />
          <Input
            label="Specializations (comma separated)"
            value={form.specializations}
            onChange={(event) => setField("specializations", event.target.value)}
          />
          <Input
            label="Fee structure"
            value={form.fee_structure}
            onChange={(event) => setField("fee_structure", event.target.value)}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Website URL"
              value={form.website_url}
              onChange={(event) => setField("website_url", event.target.value)}
              placeholder="https://"
            />
            <Input
              label="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(event) => setField("linkedin_url", event.target.value)}
              placeholder="https://"
            />
          </div>

          <Textarea label="Bio" value={form.bio} onChange={(event) => setField("bio", event.target.value)} />

          <div className="flex items-center gap-2">
            <Button loading={saving} disabled={saving} onClick={saveProfile}>
              Save profile
            </Button>
            <Button variant="secondary" onClick={loadProfile} disabled={saving}>
              Reset
            </Button>
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Profile health</h2>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
            <div className="h-full bg-accent transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="text-caption text-text-secondary">{completionPct}% complete</p>
          <p className="text-caption text-text-muted">
            Verification: {agent?.is_verified ? "Verified" : "Pending moderation"}
          </p>
          <p className="text-caption text-text-muted">
            Listing status: {agent?.is_active ? "Active" : "Inactive"}
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
