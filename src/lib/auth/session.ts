import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { AppSession, OrganizationMembership, PlatformRole } from "./types";

type MembershipRow = {
  organization_id: string;
  role: string;
  status: string;
};

export const getAppSession = cache(async (): Promise<AppSession> => {
  const config = getSupabasePublicConfig();

  if (!config) {
    return {
      state: "unconfigured",
      reason:
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment configuration.",
    };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { state: "unauthenticated" };
  }

  const { data: membershipData, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id, role, status")
    .eq("user_id", data.user.id);

  const memberships = normalizeMemberships(
    membershipError ? [] : ((membershipData as MembershipRow[] | null) ?? []),
  );

  return {
    state: "authenticated",
    user: {
      id: data.user.id,
      email: data.user.email ?? null,
    },
    memberships,
  };
});

function normalizeMemberships(rows: MembershipRow[]): OrganizationMembership[] {
  const platformRoles: PlatformRole[] = [
    "KULTUR_OWNER",
    "KULTUR_ADMIN",
    "KULTUR_OPERATOR",
    "KULTUR_VOLUNTEER",
    "ADVERTISER_ADMIN",
    "ADVERTISER_VIEWER",
    "VENUE_ADMIN",
    "VENUE_OPERATOR",
  ];

  const roleSet = new Set(platformRoles);

  return rows
    .filter((row) => roleSet.has(row.role as PlatformRole))
    .map((row) => ({
      organizationId: row.organization_id,
      role: row.role as PlatformRole,
      status: row.status,
    }));
}
