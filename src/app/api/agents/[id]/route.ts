import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const id = decodeURIComponent(params.id);

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("agent_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (reviewsError) {
      return NextResponse.json({ error: reviewsError.message }, { status: 500 });
    }

    return NextResponse.json({
      agent,
      reviews: reviews ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch agent profile" }, { status: 500 });
  }
}
