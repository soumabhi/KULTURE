import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdvertiserOverview = {
  campaigns: Array<{ id: string; name: string; status: string }>;
  metrics: {
    campaigns: number;
    verifiedClaims: number;
    leads: number;
    vouchersIssued: number;
    vouchersRedeemed: number;
  };
};

const emptyOverview: AdvertiserOverview = {
  campaigns: [],
  metrics: {
    campaigns: 0,
    verifiedClaims: 0,
    leads: 0,
    vouchersIssued: 0,
    vouchersRedeemed: 0,
  },
};

export async function getAdvertiserOverview(
  organizationIds: string[],
): Promise<AdvertiserOverview> {
  if (!getSupabasePublicConfig() || organizationIds.length === 0) {
    return emptyOverview;
  }

  const supabase = await getSupabaseServerClient();
  const { data: campaignRows, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, status")
    .in("advertiser_organization_id", organizationIds)
    .order("created_at", { ascending: false });

  if (campaignError) {
    throw new Error("Could not load advertiser campaigns.");
  }

  const campaigns = (campaignRows ?? []).map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
  }));
  const campaignIds = campaigns.map((campaign) => campaign.id);

  if (campaignIds.length === 0) {
    return emptyOverview;
  }

  const [claims, leads, issued, redeemed] = await Promise.all([
    supabase
      .from("claims")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", campaignIds)
      .eq("verification_status", "VERIFIED"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", campaignIds),
    supabase
      .from("vouchers")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", campaignIds)
      .in("status", ["ISSUED", "ACTIVE", "REDEEMED"]),
    supabase
      .from("vouchers")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", campaignIds)
      .eq("status", "REDEEMED"),
  ]);

  if ([claims, leads, issued, redeemed].some((result) => result.error)) {
    throw new Error("Could not load campaign metrics.");
  }

  return {
    campaigns,
    metrics: {
      campaigns: campaigns.length,
      verifiedClaims: claims.count ?? 0,
      leads: leads.count ?? 0,
      vouchersIssued: issued.count ?? 0,
      vouchersRedeemed: redeemed.count ?? 0,
    },
  };
}
