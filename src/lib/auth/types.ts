export const PLATFORM_ROLES = [
  "KULTUR_OWNER",
  "KULTUR_ADMIN",
  "KULTUR_OPERATOR",
  "KULTUR_VOLUNTEER",
  "ADVERTISER_ADMIN",
  "ADVERTISER_VIEWER",
  "VENUE_ADMIN",
  "VENUE_OPERATOR",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type OrganizationType = "KULTUR" | "ADVERTISER" | "VENUE_ORGANIZER";

export type OrganizationMembership = {
  organizationId: string;
  role: PlatformRole;
  status: string;
};

export type AuthenticatedAppSession = {
  state: "authenticated";
  user: {
    id: string;
    email: string | null;
  };
  memberships: OrganizationMembership[];
};

export type AppSession =
  | {
      state: "unconfigured";
      reason: string;
    }
  | {
      state: "unauthenticated";
    }
  | AuthenticatedAppSession;
