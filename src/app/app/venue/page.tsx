import { FormSurface } from "@/components/platform/form-surface";
import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import resource from "@/components/platform/resource-page.module.css";
import workspace from "@/components/platform/workspace.module.css";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getVenueWorkspace } from "@/lib/features/venue/queries";
import { postVenueUpdate } from "./actions";

const VENUE_ROLES = ["VENUE_ADMIN", "VENUE_OPERATOR"] as const;

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function VenuePage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const session = await requireSession("/app/venue");
  const query = await searchParams;

  if (session.state === "unconfigured") {
    return <UnconfiguredCard reason={session.reason} />;
  }

  if (!hasAnyRole(session, VENUE_ROLES)) {
    return (
      <UnauthorizedCard
        title="Venue Access Required"
        description="Only venue roles can access live venue operations."
      />
    );
  }

  const organizationIds = session.memberships
    .filter((membership) =>
      (VENUE_ROLES as readonly string[]).includes(membership.role),
    )
    .map((membership) => membership.organizationId);

  const data = await getVenueWorkspace(organizationIds);

  return (
    <div className={workspace.page}>
      <section className={workspace.hero}>
        <div>
          <p className={workspace.eyebrow}>Venue workspace</p>
          <h1 className={workspace.title}>
            Keep the festival experience in sync.
          </h1>
          <p className={workspace.description}>
            Publish crowd status, announcements, and resupply alerts for the
            venues your organization manages.
          </p>
        </div>
      </section>

      <div className={resource.grid}>
        <section className={resource.surface}>
          <h2 className={resource.surfaceTitle}>Recent live updates</h2>
          {query.created === "update" ? (
            <p className={`${resource.notice} ${resource.success}`}>
              Update published.
            </p>
          ) : null}
          {query.error ? (
            <p className={`${resource.notice} ${resource.error}`}>
              {query.error}
            </p>
          ) : null}
          {data.updates.length === 0 ? (
            <p className={resource.empty}>
              No live updates yet. Publish the first crowd status or
              announcement for your event venue.
            </p>
          ) : (
            <ul className={resource.list}>
              {data.updates.map((update) => (
                <li className={resource.item} key={update.id}>
                  <div>
                    <p className={resource.itemTitle}>{update.title}</p>
                    <p className={resource.itemCopy}>
                      {update.message ? `${update.message} · ` : ""}
                      {dateFormatter.format(new Date(update.createdAt))}
                    </p>
                  </div>
                  <span className={resource.badge}>{update.updateType}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FormSurface
          formKey="update"
          title="Publish live update"
          description="Guests scanning at this venue see these updates on the campaign page."
          fields={[
            {
              name: "eventVenueId",
              label: "Event venue",
              type: "select",
              options: data.eventVenues.map((venue) => ({
                id: venue.id,
                label: `${venue.eventName} — ${venue.label}`,
              })),
            },
            {
              name: "updateType",
              label: "Update type",
              type: "select",
              options: [
                { id: "CROWD_STATUS", label: "Crowd status" },
                { id: "ANNOUNCEMENT", label: "Announcement" },
                { id: "RESUPPLY_ALERT", label: "Resupply alert" },
              ],
            },
            {
              name: "title",
              label: "Title",
              type: "text",
              placeholder: "Crowd: High",
            },
            { name: "message", label: "Message", type: "text" },
          ]}
          action={postVenueUpdate}
          submitLabel="Publish update"
          query={{ error: query.error }}
        />
      </div>
    </div>
  );
}
