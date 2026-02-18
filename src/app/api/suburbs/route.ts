import { NextResponse } from "next/server";

import { searchAustralianLocations } from "@/lib/australia-locations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const state = searchParams.get("state") ?? "";
    const limitRaw = Number.parseInt(searchParams.get("limit") ?? "12", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 50);

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = searchAustralianLocations(query, {
      state: state || undefined,
      limit,
    }).map((item) => ({
      suburb: item.locality,
      state: item.state,
      postcode: item.postcode,
    }));

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
