import { NextResponse } from "next/server";

import { pingSupabase } from "@/lib/supabase/keep-alive";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // Local/dev without a secret still works for manual checks.
  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Keep-alive endpoint for Vercel Cron (and manual curls).
 * Secured with CRON_SECRET in production.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pingSupabase();

  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
  });
}
