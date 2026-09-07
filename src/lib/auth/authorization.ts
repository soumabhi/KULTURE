import type { AuthenticatedAppSession, PlatformRole } from "./types";

export function hasAnyRole(
  session: AuthenticatedAppSession,
  allowedRoles: readonly PlatformRole[],
): boolean {
  const roleSet = new Set(allowedRoles);
  return session.memberships.some((membership) => roleSet.has(membership.role));
}

export function hasAllRoles(
  session: AuthenticatedAppSession,
  requiredRoles: readonly PlatformRole[],
): boolean {
  const sessionRoleSet = new Set(session.memberships.map((m) => m.role));
  return requiredRoles.every((role) => sessionRoleSet.has(role));
}

export function routeAccessMap(pathname: string): readonly PlatformRole[] {
  if (pathname.startsWith("/app/admin")) {
    return ["KULTUR_OWNER", "KULTUR_ADMIN", "KULTUR_OPERATOR"];
  }

  if (pathname.startsWith("/app/advertiser")) {
    return ["ADVERTISER_ADMIN", "ADVERTISER_VIEWER"];
  }

  if (pathname.startsWith("/app/venue")) {
    return ["VENUE_ADMIN", "VENUE_OPERATOR"];
  }

  if (pathname.startsWith("/app/volunteer")) {
    return ["KULTUR_VOLUNTEER"];
  }

  return [];
}
