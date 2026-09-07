import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ScanContext =
  | {
      state: "unconfigured";
      reason: string;
    }
  | {
      state: "not-found";
    }
  | {
      state: "ready";
      batch: {
        batchCode: string;
        status: string;
      };
      campaign: {
        name: string;
        status: string;
      };
      config: {
        title: string | null;
        subtitle: string | null;
        sponsorName: string | null;
        experienceType: string | null;
        gameType: string | null;
      } | null;
    };

export async function getScanContext(batchCode: string): Promise<ScanContext> {
  if (!getSupabasePublicConfig()) {
    return {
      state: "unconfigured",
      reason:
        "Supabase environment variables are missing. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("public_scan_context", {
    input_batch_code: batchCode,
  });

  const context = data?.[0];
  if (error || !context) {
    return { state: "not-found" };
  }

  return {
    state: "ready",
    batch: {
      batchCode: context.batch_code,
      status: context.batch_status,
    },
    campaign: { name: context.campaign_name, status: context.campaign_status },
    config: {
      title: context.title,
      subtitle: context.subtitle,
      sponsorName: context.sponsor_name,
      experienceType: context.experience_type,
      gameType: context.game_type,
    },
  };
}
