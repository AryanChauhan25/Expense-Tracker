import { getSupabaseCredentials, isSupabaseConfigured } from "@/lib/env";

export type KeepAliveResult = {
  ok: boolean;
  checkedAt: string;
  authHealth?: { status: number; ok: boolean };
  database?: { status: number; ok: boolean; rows?: number };
  error?: string;
};

/**
 * External ping so free-tier Supabase projects stay active.
 * Must run outside Supabase (GitHub Actions / Vercel Cron) — paused projects
 * cannot wake themselves.
 */
export async function pingSupabase(): Promise<KeepAliveResult> {
  const checkedAt = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      checkedAt,
      error: "Supabase env vars are not configured.",
    };
  }

  const { url, anonKey } = getSupabaseCredentials();

  try {
    const [authResponse, dbResponse] = await Promise.all([
      fetch(`${url}/auth/v1/health`, {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }),
      fetch(`${url}/rest/v1/expense_categories?select=id&limit=1`, {
        method: "GET",
        cache: "no-store",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Prefer: "count=exact",
        },
      }),
    ]);

    let rows: number | undefined;
    if (dbResponse.ok) {
      const data = (await dbResponse.json()) as unknown;
      rows = Array.isArray(data) ? data.length : undefined;
    }

    const authHealth = {
      status: authResponse.status,
      // Some projects return non-200 on /auth/v1/health; REST activity is what matters for pause.
      ok: authResponse.ok || authResponse.status < 500,
    };
    const database = {
      status: dbResponse.status,
      ok: dbResponse.ok,
      rows,
    };

    return {
      ok: database.ok,
      checkedAt,
      authHealth,
      database,
    };
  } catch (error) {
    return {
      ok: false,
      checkedAt,
      error: error instanceof Error ? error.message : "Keep-alive request failed.",
    };
  }
}
