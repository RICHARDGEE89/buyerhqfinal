import { NextResponse } from "next/server";

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
    const { data, error } = await supabase
      .from("enquiries")
      .insert({
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
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Unable to insert enquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true, enquiry_id: data.id });
  } catch {
    return NextResponse.json({ error: "Unable to submit enquiry" }, { status: 500 });
  }
}
