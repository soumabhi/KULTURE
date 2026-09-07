import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Starts a public scan session through the security-definer RPC. Anonymous
 * visitors never receive direct table access; the database function performs
 * the active-campaign validation, per-IP rate limiting, and session creation
 * atomically. The raw IP never reaches the database — only a peppered hash.
 */
export async function startScanSession(
  batchCode: string,
): Promise<string | null> {
  if (!getSupabasePublicConfig()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const headerStore = await headers();

  const forwarded = headerStore.get("x-forwarded-for");
  const clientIp = forwarded ? forwarded.split(",")[0]?.trim() : null;
  const ipHash = clientIp
    ? createHash("sha256")
        .update(`${process.env.KULTUR_PHONE_HASH_PEPPER ?? ""}:ip:${clientIp}`)
        .digest("hex")
    : null;

  const { data, error } = await supabase.rpc("start_public_scan", {
    input_batch_code: batchCode,
    input_user_agent: headerStore.get("user-agent"),
    input_referrer: headerStore.get("referer"),
    input_ip_hash: ipHash,
  });

  if (error || typeof data !== "string") {
    return null;
  }

  return data;
}
