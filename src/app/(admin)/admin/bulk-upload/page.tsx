"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import { runAdminAction } from "@/lib/admin-api";
import {
  parseBulkAgentRows,
  type AgentBulkParseResult,
  type DuplicateResolutionStrategy,
} from "@/lib/agent-bulk-upload";
import {
  buildUniversalAgentUploadTemplateRow,
  universalAgentUploadHeadings,
} from "@/lib/buyerhqrank-simplified";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type UploadDuplicateStrategy = DuplicateResolutionStrategy | "ask";
type RawUploadRow = Record<string, unknown>;

const stateOptions = ["", "NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export default function BulkUploadPage() {
  const [loadedRows, setLoadedRows] = useState<RawUploadRow[]>([]);
  const [loadedFileName, setLoadedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preview, setPreview] = useState<AgentBulkParseResult | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<UploadDuplicateStrategy>("ask");
  const [defaultState, setDefaultState] = useState("VIC");

  const previewSummary = useMemo(() => {
    return {
      validRows: preview?.rows.length ?? 0,
      errorCount: preview?.errors.length ?? 0,
      duplicateCount: (preview?.duplicateAgencyKeys.length ?? 0) + (preview?.duplicateAgentNames.length ?? 0),
    };
  }, [preview]);

  const validateRows = () => {
    if (loadedRows.length === 0) {
      setResult({ success: false, message: "Upload a CSV or Excel file first." });
      setPreview(null);
      return null;
    }
    const parsed = parseBulkAgentRows(loadedRows, { defaultState });
    setPreview(parsed);
    if (parsed.errors.length > 0) {
      setResult({
        success: false,
        message: `Validation found ${parsed.errors.length} issue(s).`,
      });
      return null;
    }
    setResult({
      success: true,
      message: `Validation passed. ${parsed.rows.length} row(s) ready for upload.`,
    });
    return parsed;
  };

  const handleSpreadsheetFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xls", "xlsx"].includes(extension)) {
      throw new Error("Use CSV or Excel only (.csv, .xls, .xlsx).");
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("No worksheet found in uploaded file.");
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<RawUploadRow>(sheet, { defval: "" });

    setLoadedRows(rows);
    setLoadedFileName(file.name);
    setPreview(null);
    setResult({
      success: true,
      message: `${file.name} loaded with ${rows.length} row(s). Click Validate.`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResult(null);
    try {
      await handleSpreadsheetFile(file);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unable to parse file.",
      });
    } finally {
      event.currentTarget.value = "";
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setResult(null);

    try {
      const parsed = preview ?? parseBulkAgentRows(loadedRows, { defaultState });
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

      let strategyToUse: DuplicateResolutionStrategy = duplicateStrategy === "ask" ? "abort" : duplicateStrategy;
      if (duplicateStrategy === "ask" && hasInlineDuplicates(parsed)) {
        const promptChoice = promptDuplicateChoice(parsed);
        if (!promptChoice) {
          setResult({
            success: false,
            message: "Upload cancelled. Resolve duplicates or choose a duplicate strategy.",
          });
          setIsUploading(false);
          return;
        }
        strategyToUse = promptChoice;
      }

      try {
        await runAdminAction({
          type: "bulk_upsert_agents",
          rows: parsed.rows,
          duplicate_strategy: strategyToUse,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        if (duplicateStrategy === "ask" && isDuplicateErrorMessage(message)) {
          const promptChoice = promptDuplicateChoice(parsed, message);
          if (!promptChoice) {
            setResult({
              success: false,
              message: "Upload cancelled because duplicate handling was not selected.",
            });
            setIsUploading(false);
            return;
          }
          await runAdminAction({
            type: "bulk_upsert_agents",
            rows: parsed.rows,
            duplicate_strategy: promptChoice,
          });
        } else {
          throw error;
        }
      }

      setResult({
        success: true,
        message: `Upload complete. ${parsed.rows.length} profile(s) processed.`,
      });
      setLoadedRows([]);
      setLoadedFileName("");
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

  const downloadCsvTemplate = () => {
    const templateRow = buildUniversalAgentUploadTemplateRow();
    const header = universalAgentUploadHeadings.join(",");
    const row = universalAgentUploadHeadings
      .map((heading) => csvValue(templateRow[heading]))
      .join(",");
    const csv = `${header}\n${row}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "buyerhq_universal_upload_template.csv";
    link.click();
    URL.revokeObjectURL(url);
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
        <h1 className="text-heading">Universal agency upload</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Upload Excel or CSV directly. No JSON step required. Use the template below for fastest imports.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_380px]">
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 font-mono text-label uppercase text-text-secondary">
              <FileSpreadsheet size={14} />
              File upload only
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-text-secondary hover:text-text-primary">
                <Upload size={14} />
                Import file
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(event) => void handleFileUpload(event)}
                />
              </label>
              <Button variant="secondary" onClick={validateRows}>
                Validate
              </Button>
              <Button variant="secondary" onClick={downloadCsvTemplate}>
                Download CSV template
              </Button>
              <Button loading={isUploading} onClick={handleUpload} disabled={isUploading}>
                Upload
              </Button>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
              File: <span className="text-text-primary">{loadedFileName || "No file loaded yet."}</span>
            </div>
            <div className="rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
              Rows detected: <span className="text-text-primary">{loadedRows.length}</span>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
              Default state for blank rows
              <select
                value={defaultState}
                onChange={(event) => setDefaultState(event.target.value)}
                className="mt-1 block w-full rounded-md border border-border bg-surface px-2 py-1 text-body-sm text-text-primary"
              >
                {stateOptions.map((state) => (
                  <option key={`state-${state || "blank"}`} value={state}>
                    {state || "No default"}
                  </option>
                ))}
              </select>
            </label>
            <label className="rounded-md border border-border bg-surface-2 px-3 py-2 text-caption text-text-secondary">
              Duplicate handling
              <select
                value={duplicateStrategy}
                onChange={(event) => setDuplicateStrategy(event.target.value as UploadDuplicateStrategy)}
                className="mt-1 block w-full rounded-md border border-border bg-surface px-2 py-1 text-body-sm text-text-primary"
              >
                <option value="ask">Ask me when duplicates are detected</option>
                <option value="abort">Block upload if duplicates exist</option>
                <option value="update_existing">Update matching existing records</option>
                <option value="skip_duplicates">Skip duplicate rows</option>
              </select>
            </label>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Universal accepted headings</h2>
            <p className="overflow-x-auto rounded-md border border-border bg-surface-2 p-2 font-mono text-[11px] leading-5 text-text-secondary">
              {universalAgentUploadHeadings.join(" | ")}
            </p>
          </Card>

          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Preview</h2>
            <p className="text-caption text-text-secondary">
              Valid rows: <span className="text-text-primary">{previewSummary.validRows}</span>
            </p>
            <p className="text-caption text-text-secondary">
              Errors: <span className="text-text-primary">{previewSummary.errorCount}</span>
            </p>
            <p className="text-caption text-text-secondary">
              Duplicates: <span className="text-text-primary">{previewSummary.duplicateCount}</span>
            </p>
            {preview?.errors.length ? (
              <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-destructive/30 bg-destructive/10 p-2">
                {preview.errors.map((item) => (
                  <p key={item} className="text-caption text-destructive">
                    {item}
                  </p>
                ))}
              </div>
            ) : null}
            {preview && hasInlineDuplicates(preview) ? (
              <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-border bg-surface-2 p-2">
                {preview.duplicateAgencyKeys.map((item) => (
                  <p key={`agency-${item}`} className="text-caption text-text-secondary">
                    agency: {item}
                  </p>
                ))}
                {preview.duplicateAgentNames.map((item) => (
                  <p key={`agent-${item}`} className="text-caption text-text-secondary">
                    agent: {item}
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

function csvValue(value: unknown) {
  if (value === null || value === undefined) return "\"\"";
  const text = String(value).replaceAll("\"", "\"\"");
  return `"${text}"`;
}

function isDuplicateErrorMessage(message: string) {
  return message.toLowerCase().includes("duplicate");
}

function hasInlineDuplicates(result: AgentBulkParseResult) {
  return result.duplicateAgencyKeys.length > 0 || result.duplicateAgentNames.length > 0;
}

function promptDuplicateChoice(
  result: AgentBulkParseResult,
  contextMessage?: string
): DuplicateResolutionStrategy | null {
  const duplicateKeys = [
    ...result.duplicateAgencyKeys.map((item) => `agency:${item}`),
    ...result.duplicateAgentNames.map((item) => `agent:${item}`),
  ];
  const preview = duplicateKeys.slice(0, 6).join(", ");
  const rawChoice = window.prompt(
    `${contextMessage ? `${contextMessage}\n` : ""}` +
      `Duplicate agents/agencies detected (${duplicateKeys.length || "existing"}). ` +
      `Examples: ${preview || "n/a"}.\n` +
      'Type "update" to update existing records, "skip" to skip duplicates, or "cancel" to stop upload.',
    "update"
  );
  if (!rawChoice) return null;
  const normalized = rawChoice.trim().toLowerCase();
  if (normalized.startsWith("update")) return "update_existing";
  if (normalized.startsWith("skip")) return "skip_duplicates";
  return null;
}
