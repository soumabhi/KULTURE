import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import { AdminWorkspace } from "@/components/platform/workspace";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getAdminOverview } from "@/lib/features/admin/overview";

const ADMIN_ROLES = [
  "KULTUR_OWNER",
  "KULTUR_ADMIN",
  "KULTUR_OPERATOR",
] as const;

export default async function AdminSurfacePage() {
  const session = await requireSession("/app/admin");

  if (session.state === "unconfigured") {
    return <UnconfiguredCard reason={session.reason} />;
  }

  if (!hasAnyRole(session, ADMIN_ROLES)) {
    return (
      <UnauthorizedCard
        title="Admin Access Required"
        description="Only Kultur owner/admin/operator roles can access this workspace."
      />
    );
  }

  const overview = await getAdminOverview();
  return (
    <AdminWorkspace
      metrics={overview.metrics}
      configured={overview.state === "ready"}
    />
  );
}
