"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, FileJson, Upload } from "lucide-react";

import { runAdminAction } from "@/lib/admin-api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import type { Database } from "@/lib/database.types";

type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
type ParseResult = {
  rows: AgentInsert[];
  errors: string[];
};

const stateCodes = new Set(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"]);

const starterJson = `[
  {
    "name": "Jordan Walsh",
    "email": "jordan.walsh@example.com",
    "agency_name": "Harbour Buyer Advisory",
    "state": "NSW",
    "suburbs": ["Bondi", "Coogee"],
    "specializations": ["Luxury", "Negotiation"],
    "years_experience": 8,
    "fee_structure": "Fixed fee from $12,500"
  }
]`;

export default function BulkUploadPage() {
  const [jsonData, setJsonData] = useState(starterJson);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preview, setPreview] = useState<ParseResult | null>(null);

  const buildRows = (): ParseResult => {
    const parsed = JSON.parse(jsonData) as unknown;
    const inputRows = Array.isArray(parsed) ? parsed : [parsed];

    const rows: AgentInsert[] = [];
    const errors: string[] = [];

    inputRows.forEach((rawItem, index) => {
      if (!rawItem || typeof rawItem !== "object") {
        errors.push(`Row ${index + 1}: must be an object.`);
        return;
      }

      const raw = rawItem as Record<string, unknown>;
      const name = toText(raw.name) || `${toText(raw.first_name)} ${toText(raw.last_name)}`.trim();
      const email = toText(raw.email).toLowerCase();

      if (!name) {
        errors.push(`Row ${index + 1}: missing required field "name".`);
        return;
      }
      if (!email) {
        errors.push(`Row ${index + 1}: missing required field "email".`);
        return;
      }

      const state = (toText(raw.state) || toText(raw.primary_state)).toUpperCase();
      if (state && !stateCodes.has(state)) {
        errors.push(`Row ${index + 1}: state "${state}" is invalid.`);
        return;
      }

      const suburbs =
        toStringArray(raw.suburbs) ??
        toStringArray(raw.suburb_coverage) ??
        (toText(raw.primary_suburb) ? [toText(raw.primary_suburb)] : []);

      const specializations = toStringArray(raw.specializations) ?? toStringArray(raw.specialisations) ?? [];

      rows.push({
        name,
        email,
        phone: toText(raw.phone) || null,
        agency_name: toText(raw.agency_name) || toText(raw.business_name) || null,
        bio: toText(raw.bio) || null,
        avatar_url: toText(raw.avatar_url) || toText(raw.headshot_url) || null,
        state: state ? (state as AgentInsert["state"]) : null,
        suburbs,
        specializations,
        years_experience: toInt(raw.years_experience),
        properties_purchased: toInt(raw.properties_purchased) ?? toInt(raw.total_properties),
        is_verified: toBoolean(raw.is_verified) ?? false,
        is_active: toBoolean(raw.is_active) ?? true,
        licence_number: toText(raw.licence_number) || null,
        fee_structure: toText(raw.fee_structure) || toText(raw.fee_description) || null,
        website_url: toText(raw.website_url) || null,
        linkedin_url: toText(raw.linkedin_url) || null,
      });
    });

    return { rows, errors };
  };

  const validateJson = () => {
    setResult(null);
    try {
      const parsed = buildRows();
      setPreview(parsed);
      if (parsed.errors.length > 0) {
        setResult({
          success: false,
          message: `Validation found ${parsed.errors.length} issue(s).`,
        });
      } else {
        setResult({
          success: true,
          message: `Validation passed. ${parsed.rows.length} row(s) ready for upload.`,
        });
      }
    } catch (parseError) {
      setPreview(null);
      setResult({
        success: false,
        message: parseError instanceof Error ? parseError.message : "Invalid JSON payload.",
      });
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setResult(null);

    try {
      const parsed = buildRows();
      setPreview(parsed);

      if (parsed.rows.length === 0) {
        setResult({ success: false, message: "No valid rows found to upload." });
        setIsUploading(false);
        return;
      }

      if (parsed.errors.length > 0) {
        setResult({
          success: false,
          message: `Fix ${parsed.errors.length} validation issue(s) before upload.`,
        });
        setIsUploading(false);
        return;
      }

      await runAdminAction({ type: "bulk_upsert_agents", rows: parsed.rows });

      setResult({
        success: true,
        message: `Upload complete. ${parsed.rows.length} profile(s) upserted.`,
      });
      setJsonData(starterJson);
      setPreview(null);
    } catch (uploadError) {
      setResult({
        success: false,
        message: uploadError instanceof Error ? uploadError.message : "Upload failed.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <Link href="/admin" className="inline-flex items-center gap-2 text-caption text-text-secondary hover:text-text-primary">
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </div>
        <h1 className="text-heading">Bulk agent upload</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Paste JSON records to create or update agent profiles in one operation.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-2 font-mono text-label uppercase text-text-secondary">
              <FileJson size={14} />
              JSON payload
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={validateJson}>
                Validate
              </Button>
              <Button loading={isUploading} onClick={handleUpload} disabled={isUploading}>
                <Upload size={16} />
                Upload
              </Button>
            </div>
          </div>
          <Textarea
            value={jsonData}
            onChange={(event) => setJsonData(event.target.value)}
            className="min-h-[360px] font-mono text-caption"
            placeholder={starterJson}
          />
        </Card>

        <div className="space-y-3">
          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Schema notes</h2>
            <ul className="space-y-1 text-caption text-text-secondary">
              <li>Required fields: name, email</li>
              <li>Supports legacy keys: business_name, primary_state, specialisations</li>
              <li>Upsert key: email (existing records will be updated)</li>
              <li>State must be one of NSW, VIC, QLD, WA, SA, TAS, ACT, NT</li>
            </ul>
          </Card>

          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Validation preview</h2>
            <p className="text-caption text-text-secondary">
              Valid rows: <span className="text-text-primary">{preview?.rows.length ?? 0}</span>
            </p>
            <p className="text-caption text-text-secondary">
              Errors: <span className="text-text-primary">{preview?.errors.length ?? 0}</span>
            </p>
            {preview?.errors.length ? (
              <div className="max-h-32 space-y-1 overflow-auto rounded-md border border-destructive/30 bg-destructive/10 p-2">
                {preview.errors.map((item) => (
                  <p key={item} className="text-caption text-destructive">
                    {item}
                  </p>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      </section>

      {result ? (
        <div
          className={`flex items-center gap-2 rounded-md border p-3 text-body-sm ${
            result.success
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {result.success ? <CheckCircle2 size={16} /> : <CircleAlert size={16} />}
          {result.message}
        </div>
      ) : null}
    </div>
  );
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function toInt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return null;
}
