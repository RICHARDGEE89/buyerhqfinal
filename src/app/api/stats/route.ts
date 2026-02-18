import { NextResponse } from "next/server";

import { agentIsActive, agentIsVerified, normalizeAgents } from "@/lib/agent-compat";
import type { AgentRow } from "@/lib/database.types";
import { isPolicyRecursionError } from "@/lib/db-errors";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

export async function GET() {
  try {
    const supabase = createClient();

    const { data: agentsData, error: agentsError } = await supabase.from("agents").select("*");
    if (agentsError) {
      if (isPolicyRecursionError(agentsError.message)) {
        return NextResponse.json({
          verifiedAgents: 0,
          statesCovered: 0,
          enquiriesMtd: 0,
          avgResponseTime: "< 2hrs",
        });
      }
      return NextResponse.json({ error: agentsError.message }, { status: 500 });
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

    const agents = normalizeAgents((agentsData ?? []) as AgentRow[]);
    const visibleAgents = agents.filter((agent) => agentIsActive(agent) && agentIsVerified(agent));
    const statesCovered = new Set(visibleAgents.map((item) => item.state).filter(Boolean)).size;

    return NextResponse.json({
      verifiedAgents: visibleAgents.length,
      statesCovered,
      enquiriesMtd: enquiriesMtd ?? 0,
      avgResponseTime: "< 2hrs",
    });
  } catch {
    return NextResponse.json({ error: "Unable to load stats" }, { status: 500 });
  }
}
