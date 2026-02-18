"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, CreditCard, ReceiptText } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import type { AgentProfileRow, AgentRow, EnquiryRow } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/client";

type PlanKey = AgentProfileRow["subscription_plan"];

const planPrices: Record<PlanKey, { monthly: number; annual: number }> = {
  starter: { monthly: 79, annual: 790 },
  "verified-partner": { monthly: 149, annual: 1490 },
  enterprise: { monthly: 299, annual: 2990 },
};

const planNames: Record<PlanKey, string> = {
  starter: "Starter",
  "verified-partner": "Verified Partner",
  enterprise: "Enterprise",
};

export default function AgentBillingPage() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentRow | null>(null);
  const [profile, setProfile] = useState<AgentProfileRow | null>(null);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [cardBrand, setCardBrand] = useState("");
  const [cardLast4, setCardLast4] = useState("");

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.href = "/agent-portal/login";
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("agent_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData?.agent_id) {
      setError(profileError?.message ?? "No linked billing profile found.");
      setLoading(false);
      return;
    }

    const [agentRes, enquiryRes] = await Promise.all([
      supabase.from("agents").select("*").eq("id", profileData.agent_id).single(),
      supabase.from("enquiries").select("*").eq("agent_id", profileData.agent_id).order("created_at", { ascending: false }),
    ]);

    if (agentRes.error || !agentRes.data) {
      setError(agentRes.error?.message ?? "Unable to load agent account.");
      setLoading(false);
      return;
    }

    if (enquiryRes.error) {
      setError(enquiryRes.error.message);
      setLoading(false);
      return;
    }

    setAgent(agentRes.data);
    setProfile(profileData);
    setEnquiries(enquiryRes.data ?? []);
    setCardBrand(profileData.card_brand ?? "Visa");
    setCardLast4(profileData.card_last4 ?? "4242");
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadBilling();
  }, [loadBilling]);

  const persistProfile = async (patch: Partial<AgentProfileRow>) => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase.from("agent_profiles").update(patch).eq("id", profile.id);
    if (updateError) {
      setError(updateError.message);
    } else {
      setProfile((current) => (current ? { ...current, ...patch } : current));
      setSuccess("Billing settings updated.");
    }
    setSaving(false);
  };

  const selectedPlan = profile?.subscription_plan ?? "starter";
  const selectedCycle = profile?.billing_cycle ?? "monthly";
  const subscriptionStatus = profile?.subscription_status ?? "active";
  const planCost = planPrices[selectedPlan][selectedCycle];
  const nextBillingDate = profile?.next_billing_at
    ? new Date(profile.next_billing_at)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const thisMonth = new Date();
  thisMonth.setUTCDate(1);
  thisMonth.setUTCHours(0, 0, 0, 0);
  const monthEnquiries = enquiries.filter((item) => new Date(item.created_at) >= thisMonth).length;

  const invoiceHistory = Array.from({ length: 4 }, (_, index) => {
    const issuedAt = new Date(nextBillingDate);
    issuedAt.setMonth(issuedAt.getMonth() - (index + 1));
    return {
      id: `INV-${issuedAt.getFullYear()}${String(issuedAt.getMonth() + 1).padStart(2, "0")}`,
      issuedAt,
      amount: planCost,
      status: "paid",
    };
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error && !profile) {
    return <ErrorState description={error} onRetry={loadBilling} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-heading">Billing & subscription</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Manage your plan, cycle, payment details, and subscription status.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Current plan" value={planNames[selectedPlan]} />
        <StatCard label="Cycle" value={selectedCycle === "monthly" ? "Monthly" : "Annual"} />
        <StatCard label="Leads this month" value={monthEnquiries} />
      </section>

      <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <Card className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-subheading">Subscription plan</h2>
                <p className="text-caption text-text-secondary">
                  Status: {subscriptionStatus} {profile?.cancel_at_period_end ? "(cancel at period end)" : ""}
                </p>
              </div>
              <p className="text-heading text-text-primary">${planCost}</p>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {(Object.keys(planNames) as PlanKey[]).map((plan) => (
                <Button
                  key={plan}
                  variant={selectedPlan === plan ? "primary" : "secondary"}
                  loading={saving && selectedPlan === plan}
                  disabled={saving}
                  onClick={() => persistProfile({ subscription_plan: plan })}
                >
                  {planNames[plan]}
                </Button>
              ))}
            </div>

            <Select
              label="Billing cycle"
              value={selectedCycle}
              onChange={(event) =>
                persistProfile({ billing_cycle: event.target.value as AgentProfileRow["billing_cycle"] })
              }
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
              ]}
            />

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-2 p-3">
              <CalendarClock size={16} className="text-text-secondary" />
              <p className="text-body-sm text-text-secondary">
                Next billing date:{" "}
                <span className="text-text-primary">{nextBillingDate.toLocaleDateString("en-AU")}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={profile?.cancel_at_period_end ? "primary" : "secondary"}
                loading={saving}
                disabled={saving}
                onClick={() =>
                  persistProfile({
                    cancel_at_period_end: !profile?.cancel_at_period_end,
                    subscription_status: !profile?.cancel_at_period_end ? "cancelled" : "active",
                  })
                }
              >
                {profile?.cancel_at_period_end ? "Reactivate subscription" : "Cancel at period end"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <h2 className="text-subheading">Payment method</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Card brand"
                value={cardBrand}
                onChange={(event) => setCardBrand(event.target.value)}
                placeholder="Visa"
              />
              <Input
                label="Last 4 digits"
                value={cardLast4}
                onChange={(event) => setCardLast4(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4242"
              />
            </div>
            <Button
              variant="secondary"
              loading={saving}
              disabled={saving || cardLast4.length !== 4}
              onClick={() =>
                persistProfile({
                  card_brand: cardBrand.trim() || null,
                  card_last4: cardLast4.trim() || null,
                })
              }
            >
              <CreditCard size={16} />
              Save payment details
            </Button>
          </Card>
        </div>

        <Card className="space-y-3 p-4">
          <h2 className="text-subheading">Invoice history</h2>
          {invoiceHistory.length === 0 ? (
            <EmptyState title="No invoices yet" description="Invoices will appear after your first billing cycle." />
          ) : (
            <div className="space-y-2">
              {invoiceHistory.map((invoice) => (
                <div key={invoice.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-sm text-text-primary">{invoice.id}</p>
                      <p className="text-caption text-text-secondary">
                        {invoice.issuedAt.toLocaleDateString("en-AU")} · ${invoice.amount}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border-light bg-surface-2 px-2 py-1 font-mono text-caption uppercase text-text-secondary">
                      <ReceiptText size={12} />
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-caption text-text-muted">
            Billing contact: {agent?.email ?? "Unknown"} · Agency: {agent?.agency_name ?? "Unknown"}
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
