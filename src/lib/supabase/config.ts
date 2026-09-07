import { z } from "zod";

const supabaseUrlSchema = z.string().url();

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

/**
 * Accepts both Supabase key generations:
 * - legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY (JWT, "anon" key)
 * - current: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ("sb_publishable_...")
 */
export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = supabaseUrlSchema.safeParse(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url.success || !key || key.length === 0) {
    return null;
  }

  return { url: url.data, anonKey: key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}
