import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const name =
      payload.name?.trim() || `${payload.firstName ?? ""} ${payload.lastName ?? ""}`.trim();
    const email = payload.email?.trim();
    const subject = payload.subject?.trim();
    const message = payload.message?.trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "name, email, subject and message are required" }, { status: 400 });
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    const supabase = createClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to submit contact message" }, { status: 500 });
  }
}

