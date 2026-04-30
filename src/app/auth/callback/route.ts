import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/workouts";
  const errorDescription = url.searchParams.get("error_description");

  if (errorDescription) {
    const fail = new URL("/login", request.url);
    fail.searchParams.set("error", errorDescription);
    return NextResponse.redirect(fail);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const fail = new URL("/login", request.url);
      fail.searchParams.set("error", error.message);
      return NextResponse.redirect(fail);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
