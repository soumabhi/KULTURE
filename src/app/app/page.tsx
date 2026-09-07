import Link from "next/link";
import { requireSession } from "@/lib/auth/route-guards";
import { UnconfiguredCard } from "@/components/platform/guard-cards";

export default async function PlatformHomePage() {
  const session = await requireSession("/app");

  if (session.state === "unconfigured") {
    return <UnconfiguredCard reason={session.reason} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white/80 p-7 shadow-lg">
        <p className="text-xs font-medium tracking-[0.08em] text-muted uppercase">
          Platform Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">
          KULTUR Operations Control Surface
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          This SaaS space controls the full operational chain from organizations
          to campaigns, activations, batches, scans, claims, and voucher
          redemption.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow"
          href="/app/admin"
        >
          <h2 className="text-lg font-semibold text-ink">Admin Surface</h2>
          <p className="mt-1 text-sm text-muted">
            Organizations, events, campaigns, activations, production.
          </p>
        </Link>

        <Link
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow"
          href="/app/advertiser"
        >
          <h2 className="text-lg font-semibold text-ink">Advertiser Surface</h2>
          <p className="mt-1 text-sm text-muted">
            Campaign visibility, qualified leads, voucher performance.
          </p>
        </Link>

        <Link
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow"
          href="/app/venue"
        >
          <h2 className="text-lg font-semibold text-ink">Venue Surface</h2>
          <p className="mt-1 text-sm text-muted">
            Event venues, live updates, crowd and operational status.
          </p>
        </Link>

        <Link
          className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow"
          href="/app/volunteer"
        >
          <h2 className="text-lg font-semibold text-ink">Volunteer Surface</h2>
          <p className="mt-1 text-sm text-muted">
            Assignment intake, delivery confirmation, field updates.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white/80 p-6 shadow">
        <h2 className="text-xl font-semibold text-ink">
          Current Signed-in Identity
        </h2>
        <p className="mt-2 text-sm text-muted">User ID: {session.user.id}</p>
        <p className="mt-1 text-sm text-muted">
          Email: {session.user.email ?? "Not available"}
        </p>
        <p className="mt-4 text-sm font-medium text-ink">
          Organization memberships ({session.memberships.length})
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {session.memberships.map((membership) => (
            <li key={`${membership.organizationId}:${membership.role}`}>
              {membership.organizationId} - {membership.role} -{" "}
              {membership.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
