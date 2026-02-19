import { NextResponse } from "next/server";

import { extractMissingColumnName, isPolicyRecursionError } from "@/lib/db-errors";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      agent_id?: string;
      buyer_name?: string;
      buyer_email?: string;
      buyer_phone?: string;
      budget_min?: number;
      budget_max?: number;
      target_suburbs?: string[];
      property_type?: string;
      message?: string;
      status?: "new" | "viewed" | "responded" | "closed";
    };

    if (!payload.agent_id || !payload.buyer_name || !payload.buyer_email || !payload.message) {
      return NextResponse.json(
        { error: "agent_id, buyer_name, buyer_email and message are required" },
        { status: 400 }
      );
    }

    if (!emailPattern.test(payload.buyer_email)) {
      return NextResponse.json({ error: "Please provide a valid buyer_email" }, { status: 400 });
    }

    const supabase = createClient();
    const insertPayload: Database["public"]["Tables"]["enquiries"]["Insert"] & Record<string, unknown> = {
      agent_id: payload.agent_id,
      buyer_name: payload.buyer_name,
      buyer_email: payload.buyer_email,
      buyer_phone: payload.buyer_phone ?? null,
      budget_min: payload.budget_min ?? null,
      budget_max: payload.budget_max ?? null,
      target_suburbs: payload.target_suburbs ?? [],
      property_type: payload.property_type ?? null,
      message: payload.message,
      status: payload.status ?? "new",
    };

    const strippedColumns: string[] = [];
    let enquiryId: string | null = null;
    let lastError: string | null = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const { data, error } = await supabase
        .from("enquiries")
        .insert(insertPayload as Database["public"]["Tables"]["enquiries"]["Insert"])
        .select("id")
        .single();
      if (!error && data?.id) {
        enquiryId = data.id;
        break;
      }

      lastError = error?.message ?? "Unable to insert enquiry";
      if (error && isPolicyRecursionError(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const missingColumn = error ? extractMissingColumnName(error.message, "enquiries") : null;
      if (missingColumn && Object.prototype.hasOwnProperty.call(insertPayload, missingColumn)) {
        delete insertPayload[missingColumn];
        strippedColumns.push(missingColumn);
        continue;
      }

      break;
    }

    if (!enquiryId) {
      return NextResponse.json({ error: lastError ?? "Unable to insert enquiry" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      enquiry_id: enquiryId,
      schemaFallback: strippedColumns.length > 0,
      strippedColumns,
    });
  } catch {
    return NextResponse.json({ error: "Unable to submit enquiry" }, { status: 500 });
  }
}
