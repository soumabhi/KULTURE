import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import resource from "@/components/platform/resource-page.module.css";
import workspace from "@/components/platform/workspace.module.css";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getAdvertiserOverview } from "@/lib/features/advertiser/overview";
import { RedeemForm } from "./redeem-form";

const ADVERTISER_ROLES = ["ADVERTISER_ADMIN", "ADVERTISER_VIEWER"] as const;

export default async function AdvertiserPage() {
  const session = await requireSession("/app/advertiser");

  if (session.state === "unconfigured") {
    return <UnconfiguredCard reason={session.reason} />;
  }

  if (!hasAnyRole(session, ADVERTISER_ROLES)) {
    return (
      <UnauthorizedCard
        title="Advertiser Access Required"
        description="Only advertiser roles can access campaign analytics and voucher redemption."
      />
    );
  }

  const organizationIds = session.memberships
    .filter((membership) =>
      (ADVERTISER_ROLES as readonly string[]).includes(membership.role),
    )
    .map((membership) => membership.organizationId);

  const overview = await getAdvertiserOverview(organizationIds);
  const canRedeem = hasAnyRole(session, ["ADVERTISER_ADMIN"]);

  const metrics = [
    { label: "Campaigns", value: overview.metrics.campaigns },
    { label: "Verified claims", value: overview.metrics.verifiedClaims },
    { label: "Leads", value: overview.metrics.leads },
    { label: "Vouchers issued", value: overview.metrics.vouchersIssued },
    { label: "Vouchers redeemed", value: overview.metrics.vouchersRedeemed },
  ];

  return (
    <div className={workspace.page}>
      <section className={workspace.hero}>
        <div>
          <p className={workspace.eyebrow}>Advertiser workspace</p>
          <h1 className={workspace.title}>
            See what the physical campaign delivers.
          </h1>
          <p className={workspace.description}>
            Verified claims, consented leads, and voucher outcomes from your
            campaigns — scoped to your organization only.
          </p>
        </div>
      </section>

      <section className={workspace.metrics} aria-label="Campaign metrics">
        {metrics.map((metric) => (
          <article className={workspace.metric} key={metric.label}>
            <p className={workspace.metricLabel}>{metric.label}</p>
            <p className={workspace.metricValue}>
              {metric.value.toLocaleString("en-IN")}
            </p>
          </article>
        ))}
      </section>

      <div className={resource.grid}>
        <section className={resource.surface}>
          <h2 className={resource.surfaceTitle}>Your campaigns</h2>
          {overview.campaigns.length === 0 ? (
            <p className={resource.empty}>
              No campaigns are linked to your organization yet. Kultur
              operations will attach your campaign here once it is created.
            </p>
          ) : (
            <ul className={resource.list}>
              {overview.campaigns.map((campaign) => (
                <li className={resource.item} key={campaign.id}>
                  <p className={resource.itemTitle}>{campaign.name}</p>
                  <span className={resource.badge}>{campaign.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={resource.surface}>
          <h2 className={resource.surfaceTitle}>Voucher redemption desk</h2>
          {canRedeem ? (
            <RedeemForm />
          ) : (
            <p className={resource.empty}>
              Redemption requires the advertiser admin role. Ask your
              organization admin to redeem vouchers or upgrade your access.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
