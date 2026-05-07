import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile-server";

type RequestBody = {
  token?: string;
  expectedAction?: "login" | "support";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const token = body.token?.trim();

    if (!token) {
      return NextResponse.json({ error: "Missing Turnstile token." }, { status: 400 });
    }

    const remoteIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const verification = await verifyTurnstileToken(token, body.expectedAction, remoteIp);

    if (!verification.ok) {
      return NextResponse.json(
        {
          error: verification.error,
          details: verification.details,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}