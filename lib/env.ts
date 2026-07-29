import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export const clientEnv = parsed.success
  ? parsed.data
  : ({} as z.infer<typeof clientEnvSchema>);

export function isSupabaseConfigured(): boolean {
  return Boolean(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL &&
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getSupabaseCredentials(): {
  url: string;
  anonKey: string;
} {
  const url = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and set your project URL and anon key.",
    );
  }

  return { url, anonKey };
}
