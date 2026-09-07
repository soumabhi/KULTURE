import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrganizationListItem = {
  id: string;
  name: string;
  slug: string;
  organizationType: string;
  status: string;
  createdAt: string;
};

export type OrganizationMemberItem = {
  id: string;
  organizationName: string;
  userId: string;
  role: string;
  status: string;
};

export async function listOrganizations(): Promise<OrganizationListItem[]> {
  if (!getSupabasePublicConfig()) return [];

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, organization_type, status, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load organizations.");

  return (data ?? []).map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    organizationType: organization.organization_type,
    status: organization.status,
    createdAt: organization.created_at,
  }));
}

export async function listOrganizationMembers(): Promise<
  OrganizationMemberItem[]
> {
  if (!getSupabasePublicConfig()) return [];

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, user_id, role, status, organizations(name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load organization members.");

  type MemberRow = {
    id: string;
    user_id: string;
    role: string;
    status: string;
    organizations: { name: string } | { name: string }[] | null;
  };

  return ((data as MemberRow[] | null) ?? []).map((member) => {
    const organization = Array.isArray(member.organizations)
      ? member.organizations[0]
      : member.organizations;
    return {
      id: member.id,
      organizationName: organization?.name ?? "Unknown organization",
      userId: member.user_id,
      role: member.role,
      status: member.status,
    };
  });
}
