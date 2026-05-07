import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstileToken } from "@/lib/turnstile-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, turnstileToken } = body;

    if (!email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: "Missing Turnstile token" }, { status: 400 });
    }

    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const verification = await verifyTurnstileToken(turnstileToken, "support", remoteIp);

    if (!verification.ok) {
      return NextResponse.json({ error: verification.error }, { status: 403 });
    }

    const supabase = await createClient();

    const insert = await supabase.from("support_messages").insert({
      name: name || null,
      email,
      message,
    });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
