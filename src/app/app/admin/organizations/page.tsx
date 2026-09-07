import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import KeycapButton from "@/components/keycap-button";
import { FormSurface } from "@/components/platform/form-surface";
import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import styles from "@/components/platform/resource-page.module.css";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getWorkflowOptions } from "@/lib/features/admin/workflow-queries";
import {
  listOrganizationMembers,
  listOrganizations,
} from "@/lib/features/organizations/queries";
import { createOrganization } from "./actions";
import { addOrganizationMember } from "../workflow-actions";

const MEMBER_ROLES = [
  { id: "KULTUR_OWNER", label: "Kultur owner" },
  { id: "KULTUR_ADMIN", label: "Kultur admin" },
  { id: "KULTUR_OPERATOR", label: "Kultur operator" },
  { id: "KULTUR_VOLUNTEER", label: "Kultur volunteer" },
  { id: "ADVERTISER_ADMIN", label: "Advertiser admin" },
  { id: "ADVERTISER_VIEWER", label: "Advertiser viewer" },
  { id: "VENUE_ADMIN", label: "Venue admin" },
  { id: "VENUE_OPERATOR", label: "Venue operator" },
] as const;

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string; form?: string }>;
}) {
  const session = await requireSession("/app/admin/organizations");
  const query = await searchParams;
  if (session.state === "unconfigured")
    return <UnconfiguredCard reason={session.reason} />;
  if (
    !hasAnyRole(session, ["KULTUR_OWNER", "KULTUR_ADMIN", "KULTUR_OPERATOR"])
  ) {
    return <UnauthorizedCard title="Admin Access Required" />;
  }

  const canCreate = hasAnyRole(session, ["KULTUR_OWNER", "KULTUR_ADMIN"]);
  const [organizations, members, options] = await Promise.all([
    listOrganizations(),
    listOrganizationMembers(),
    getWorkflowOptions(),
  ]);

  return (
    <div className={styles.page}>
      <Link className={styles.back} href="/app/admin">
        <ArrowLeft size={16} /> Admin command center
      </Link>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Partner foundation</p>
          <h1 className={styles.title}>Organizations</h1>
          <p className={styles.description}>
            Register Kultur, advertiser, and venue organizer entities, then
            attach people to them with scoped roles.
          </p>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.surface}>
          <h2 className={styles.surfaceTitle}>Registered organizations</h2>
          {organizations.length === 0 ? (
            <p className={styles.empty}>
              No organizations have been created. Start by registering the
              Kultur operating organization, then add advertisers and venue
              organizers.
            </p>
          ) : (
            <ul className={styles.list}>
              {organizations.map((organization) => (
                <li className={styles.item} key={organization.id}>
                  <div>
                    <p className={styles.itemTitle}>{organization.name}</p>
                    <p className={styles.itemCopy}>
                      /{organization.slug} · {organization.status}
                    </p>
                  </div>
                  <span className={styles.badge}>
                    {organization.organizationType}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.surface}>
          <h2 className={styles.surfaceTitle}>Register organization</h2>
          {query.created === "organization" ? (
            <p className={`${styles.notice} ${styles.success}`}>
              Organization registered.
            </p>
          ) : null}
          {query.form === "organization" && query.error ? (
            <p className={`${styles.notice} ${styles.error}`}>{query.error}</p>
          ) : null}
          {canCreate ? (
            <form className={styles.form} action={createOrganization}>
              <label className={styles.label}>
                Organization name
                <input
                  className={styles.input}
                  name="name"
                  required
                  maxLength={160}
                />
              </label>
              <label className={styles.label}>
                Type
                <select
                  className={styles.select}
                  name="organizationType"
                  defaultValue="ADVERTISER"
                >
                  <option value="KULTUR">Kultur</option>
                  <option value="ADVERTISER">Advertiser</option>
                  <option value="VENUE_ORGANIZER">Venue organizer</option>
                </select>
              </label>
              <label className={styles.label}>
                Work email
                <input className={styles.input} name="email" type="email" />
              </label>
              <label className={styles.label}>
                Phone
                <input className={styles.input} name="phone" type="tel" />
              </label>
              <KeycapButton type="submit">Register organization</KeycapButton>
            </form>
          ) : (
            <p className={styles.empty}>
              Your role permits viewing registered organizations but not
              creating them.
            </p>
          )}
        </section>
      </div>

      <div className={styles.grid}>
        <section className={styles.surface}>
          <h2 className={styles.surfaceTitle}>Members</h2>
          {members.length === 0 ? (
            <p className={styles.empty}>
              No memberships yet. After a person signs in once, add their user
              id with the correct organization role.
            </p>
          ) : (
            <ul className={styles.list}>
              {members.map((member) => (
                <li className={styles.item} key={member.id}>
                  <div>
                    <p className={styles.itemTitle}>
                      {member.organizationName}
                    </p>
                    <p className={styles.itemCopy}>
                      {member.userId} · {member.status}
                    </p>
                  </div>
                  <span className={styles.badge}>{member.role}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FormSurface
          formKey="member"
          title="Add member"
          description="The user id is the person's profile id after their first sign-in."
          fields={[
            {
              name: "organizationId",
              label: "Organization",
              type: "select",
              options: options.organizations,
            },
            {
              name: "userId",
              label: "User id",
              type: "text",
              pattern: "[0-9a-fA-F-]{36}",
            },
            {
              name: "role",
              label: "Role",
              type: "select",
              options: MEMBER_ROLES,
            },
          ]}
          action={addOrganizationMember}
          submitLabel="Add member"
          query={query}
        />
      </div>
    </div>
  );
}
