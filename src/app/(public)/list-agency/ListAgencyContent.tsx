"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createClient } from "@/lib/supabase/client";

const steps = ["Account", "Personal", "Agency", "Profile", "Review"];
const stateOptions = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
const specializationOptions = [
  "First Home Buyers",
  "Luxury",
  "Investment Strategy",
  "Auction Bidding",
  "Off-Market Access",
  "Negotiation",
];

export default function ListAgencyContent() {
  const supabase = useMemo(() => createClient(), []);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [agencyName, setAgencyName] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");

  const [bio, setBio] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [targetSuburbs, setTargetSuburbs] = useState("");
  const [feeStructure, setFeeStructure] = useState("");

  const validateCurrentStep = () => {
    if (step === 0) {
      if (!email.trim() || !password || !confirmPassword) return "Complete all account fields.";
      if (password !== confirmPassword) return "Passwords do not match.";
      if (password.length < 8) return "Password should be at least 8 characters.";
    }

    if (step === 1) {
      if (!firstName.trim() || !lastName.trim()) return "Please provide your first and last name.";
    }

    if (step === 2) {
      if (!agencyName.trim() || !licenceNumber.trim() || !state)
        return "Agency, licence, and state are required.";
    }

    if (step === 3) {
      if (!bio.trim() || specializations.length === 0 || !feeStructure.trim()) {
        return "Complete profile bio, at least one specialization, and fee structure.";
      }
    }

    return null;
  };

  const onNext = () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onSubmit = async () => {
    const stepError = validateCurrentStep();
    if (stepError) {
      setError(stepError);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: "agent",
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) throw new Error(signUpError.message);

      const { data: insertedAgent, error: agentInsertError } = await supabase
        .from("agents")
        .insert({
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone: phone || null,
          agency_name: agencyName,
          bio,
          state: state as "NSW" | "VIC" | "QLD" | "WA" | "SA" | "TAS" | "ACT" | "NT",
          suburbs: targetSuburbs
            .split(",")
            .map((suburb) => suburb.trim())
            .filter(Boolean),
          specializations,
          fee_structure: feeStructure,
          licence_number: licenceNumber,
          website_url: website || null,
          is_verified: false,
          is_active: true,
        })
        .select("id")
        .single();

      if (agentInsertError) throw new Error(agentInsertError.message);

      if (signUpData.user?.id && insertedAgent?.id) {
        await supabase.from("agent_profiles").upsert({
          id: signUpData.user.id,
          agent_id: insertedAgent.id,
        });
      }

      setSuccess(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container space-y-6 pb-16 pt-10">
      <section className="rounded-xl border border-border bg-surface p-8 md:p-12">
        <h1 className="text-display text-text-primary md:text-display-lg">List Your Agency</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">
          Complete the onboarding flow to apply for a verified BuyerHQ listing.
        </p>
      </section>

      <Card className="p-6 md:p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {steps.map((label, index) => (
            <span
              key={label}
              className={`rounded-full border px-3 py-1 font-mono text-caption uppercase ${
                index <= step
                  ? "border-border-light bg-surface-2 text-text-primary"
                  : "border-border text-text-muted"
              }`}
            >
              {label}
            </span>
          ))}
        </div>

        {step === 0 ? (
          <div className="space-y-3">
            <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-3">
            <Input
              label="First Name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
            <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <Input
              label="Agency Name"
              value={agencyName}
              onChange={(event) => setAgencyName(event.target.value)}
            />
            <Input
              label="Licence Number"
              value={licenceNumber}
              onChange={(event) => setLicenceNumber(event.target.value)}
            />
            <Select
              label="State"
              value={state}
              onChange={(event) => setState(event.target.value)}
              options={stateOptions.map((item) => ({ value: item, label: item }))}
              placeholder="Select state"
            />
            <Input
              label="Website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://"
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <Textarea label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} />
            <div>
              <p className="mb-2 font-mono text-label uppercase text-text-secondary">Specializations</p>
              <div className="grid gap-2">
                {specializationOptions.map((option) => (
                  <Checkbox
                    key={option}
                    checked={specializations.includes(option)}
                    label={option}
                    onChange={(checked) =>
                      setSpecializations((current) =>
                        checked ? [...current, option] : current.filter((item) => item !== option)
                      )
                    }
                  />
                ))}
              </div>
            </div>
            <Input
              label="Target Suburbs (comma separated)"
              value={targetSuburbs}
              onChange={(event) => setTargetSuburbs(event.target.value)}
            />
            <Input
              label="Fee Structure"
              value={feeStructure}
              onChange={(event) => setFeeStructure(event.target.value)}
              placeholder="e.g. Fixed fee from $8,500"
            />
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-3 text-body-sm text-text-secondary">
            <p>
              <span className="text-text-primary">Account:</span> {email}
            </p>
            <p>
              <span className="text-text-primary">Name:</span> {firstName} {lastName}
            </p>
            <p>
              <span className="text-text-primary">Agency:</span> {agencyName}
            </p>
            <p>
              <span className="text-text-primary">Licence:</span> {licenceNumber}
            </p>
            <p>
              <span className="text-text-primary">State:</span> {state}
            </p>
            <p>
              <span className="text-text-primary">Specializations:</span>{" "}
              {specializations.join(", ") || "None selected"}
            </p>
            <p>
              <span className="text-text-primary">Target Suburbs:</span> {targetSuburbs || "Not provided"}
            </p>
            <p>
              <span className="text-text-primary">Fee Structure:</span> {feeStructure}
            </p>
          </div>
        ) : null}

        {error ? <p className="mt-4 text-caption text-destructive">{error}</p> : null}
        {success ? (
          <p className="mt-4 text-caption text-success">
            Application received. Our team will verify your licence within 2 business days.
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => {
              setError(null);
              setStep((prev) => Math.max(prev - 1, 0));
            }}
            disabled={step === 0 || loading}
          >
            Back
          </Button>

          {step < steps.length - 1 ? (
            <Button onClick={onNext} disabled={loading}>
              Next
            </Button>
          ) : (
            <Button loading={loading} onClick={onSubmit} disabled={loading || success}>
              Submit Application
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
