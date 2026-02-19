"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";

import { runAdminAction } from "@/lib/admin-api";
import { parseBulkAgentRows, type AgentBulkParseResult } from "@/lib/agent-bulk-upload";
import {
  buildSimplifiedBuyerhqrankTemplateRow,
  simplifiedBuyerhqrankHeadings,
} from "@/lib/buyerhqrank-simplified";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";

const starterJson = JSON.stringify([buildSimplifiedBuyerhqrankTemplateRow()], null, 2);

export default function BulkUploadPage() {
  const [jsonData, setJsonData] = useState(starterJson);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [preview, setPreview] = useState<AgentBulkParseResult | null>(null);

  const previewSummary = useMemo(() => {
    return {
      validRows: preview?.rows.length ?? 0,
      errorCount: preview?.errors.length ?? 0,
    };
  }, [preview]);

  const validateJson = () => {
    setResult(null);
    try {
      const parsed = JSON.parse(jsonData) as unknown;
      const nextPreview = parseBulkAgentRows(parsed);
      setPreview(nextPreview);

      if (nextPreview.errors.length > 0) {
        setResult({
          success: false,
          message: `Validation found ${nextPreview.errors.length} issue(s).`,
        });
        return;
      }

      setResult({
        success: true,
        message: `Validation passed. ${nextPreview.rows.length} row(s) ready for upload.`,
      });
    } catch (parseError) {
      setPreview(null);
      setResult({
        success: false,
        message: parseError instanceof Error ? parseError.message : "Invalid payload.",
      });
    }
  };

  const handleSpreadsheetFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (extension === "json") {
      const text = await file.text();
      setJsonData(text);
      return;
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("No worksheet found in uploaded file.");

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    setJsonData(JSON.stringify(rows, null, 2));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setResult(null);

    try {
      await handleSpreadsheetFile(file);
      setResult({
        success: true,
        message: `${file.name} loaded. Review and validate before upload.`,
      });
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
      const parsed = parseBulkAgentRows(JSON.parse(jsonData) as unknown);
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

  const downloadCsvTemplate = () => {
    const templateRow = buildSimplifiedBuyerhqrankTemplateRow();
    const header = simplifiedBuyerhqrankHeadings.join(",");
    const row = simplifiedBuyerhqrankHeadings
      .map((heading) => csvValue(templateRow[heading as keyof typeof templateRow]))
      .join(",");
    const csv = `${header}\n${row}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "buyerhqrank_bulk_template.csv";
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
        <h1 className="text-heading">Bulk agency upload</h1>
        <p className="mt-2 text-body-sm text-text-secondary">
          Upload JSON, CSV, or XLSX and let BuyerHQ parse, validate, enrich, and calculate BUYERHQRANK fields
          automatically.
        </p>
      </section>

      <section className="grid gap-3 lg:grid-cols-[1fr_360px]">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-2 font-mono text-label uppercase text-text-secondary">
              <FileSpreadsheet size={14} />
              Spreadsheet / JSON payload
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-text-secondary hover:text-text-primary">
                <Upload size={14} />
                Import file
                <input
                  type="file"
                  accept=".json,.csv,.tsv,.xlsx,.xls"
                  className="hidden"
                  onChange={(event) => void handleFileUpload(event)}
                />
              </label>
              <Button variant="secondary" onClick={validateJson}>
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
          <Textarea
            value={jsonData}
            onChange={(event) => setJsonData(event.target.value)}
            className="min-h-[380px] font-mono text-caption"
            placeholder={starterJson}
          />
        </Card>

        <div className="space-y-3">
          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Validation engine</h2>
            <ul className="space-y-1 text-caption text-text-secondary">
              <li>Draft 2020-12 JSON schema enforcement on every row.</li>
              <li>Blank numeric values auto-normalize to 0 safely.</li>
              <li>BUYERHQRANK fields are system-calculated and non-manual.</li>
              <li>Company logo fallback uses website favicon when avatar is missing.</li>
              <li>Supports JSON, CSV, TSV, XLSX, and XLS import workflows.</li>
              <li>Parses your exact simplified headings in snake_case for every user row.</li>
            </ul>
          </Card>
          <Card className="space-y-2 p-4">
            <h2 className="text-subheading">Accepted headings</h2>
            <p className="overflow-x-auto rounded-md border border-border bg-surface-2 p-2 font-mono text-[11px] leading-5 text-text-secondary">
              {simplifiedBuyerhqrankHeadings.join(" ")}
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
            {preview?.errors.length ? (
              <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-destructive/30 bg-destructive/10 p-2">
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

function csvValue(value: unknown) {
  if (value === null || value === undefined) return "\"\"";
  const text = String(value).replaceAll("\"", "\"\"");
  return `"${text}"`;
}
