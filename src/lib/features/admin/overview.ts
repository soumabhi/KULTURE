import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminOverview =
  | { state: "unconfigured"; metrics: [] }
  | {
      state: "ready";
      metrics: ReadonlyArray<{
        label: string;
        value: number;
        detail: string;
      }>;
    };

export async function getAdminOverview(): Promise<AdminOverview> {
  if (!getSupabasePublicConfig()) {
    return { state: "unconfigured", metrics: [] };
  }

  const supabase = await getSupabaseServerClient();
  const [organizations, events, campaigns, batches, claims, vouchers] =
    await Promise.all([
      supabase
        .from("organizations")
        .select("id", { count: "exact", head: true }),
      supabase.from("events").select("id", { count: "exact", head: true }),
      supabase
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
      supabase
        .from("production_batches")
        .select("id", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
      supabase
        .from("claims")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "VERIFIED"),
      supabase
        .from("vouchers")
        .select("id", { count: "exact", head: true })
        .eq("status", "REDEEMED"),
    ]);

  const results = [organizations, events, campaigns, batches, claims, vouchers];
  if (results.some((result) => result.error)) {
    throw new Error("Could not load the operational overview.");
  }

  return {
    state: "ready",
    metrics: [
      {
        label: "Organizations",
        value: organizations.count ?? 0,
        detail: "Active business network",
      },
      {
        label: "Events",
        value: events.count ?? 0,
        detail: "Managed festival instances",
      },
      {
        label: "Active campaigns",
        value: campaigns.count ?? 0,
        detail: "Commercial programs live",
      },
      {
        label: "Active batches",
        value: batches.count ?? 0,
        detail: "QR-enabled distribution",
      },
      {
        label: "Verified claims",
        value: claims.count ?? 0,
        detail: "Qualified campaign outcomes",
      },
      {
        label: "Redemptions",
        value: vouchers.count ?? 0,
        detail: "Rewards redeemed",
      },
    ],
  };
}
