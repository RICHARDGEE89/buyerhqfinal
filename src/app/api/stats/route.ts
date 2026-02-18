import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function GET() {
  try {
    const supabase = createClient();

    const { count: verifiedAgents, error: verifiedError } = await supabase
      .from("agents")
      .select("*", { count: "exact", head: true })
      .eq("is_verified", true)
      .eq("is_active", true);

    if (verifiedError) {
      return NextResponse.json({ error: verifiedError.message }, { status: 500 });
    }

    const { data: statesData, error: statesError } = await supabase
      .from("agents")
      .select("state")
      .eq("is_verified", true)
      .eq("is_active", true);

    if (statesError) {
      return NextResponse.json({ error: statesError.message }, { status: 500 });
    }

    const monthStart = new Date();
    monthStart.setUTCDate(1);
    monthStart.setUTCHours(0, 0, 0, 0);

    const { count: enquiriesMtd, error: enquiriesError } = await supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString());

    if (enquiriesError) {
      return NextResponse.json({ error: enquiriesError.message }, { status: 500 });
    }

    const statesCovered = new Set((statesData ?? []).map((item) => item.state).filter(Boolean)).size;

    return NextResponse.json({
      verifiedAgents: verifiedAgents ?? 0,
      statesCovered,
      enquiriesMtd: enquiriesMtd ?? 0,
      avgResponseTime: "< 2hrs",
    });
  } catch {
    return NextResponse.json({ error: "Unable to load stats" }, { status: 500 });
  }
}
