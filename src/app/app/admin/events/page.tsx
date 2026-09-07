import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  FormSurface,
  type FormQuery,
} from "@/components/platform/form-surface";
import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import styles from "@/components/platform/resource-page.module.css";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getWorkflowOptions } from "@/lib/features/admin/workflow-queries";
import { createEvent, createVenue, linkEventVenue } from "../workflow-actions";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<FormQuery>;
}) {
  const session = await requireSession("/app/admin/events");
  const query = await searchParams;
  if (session.state === "unconfigured")
    return <UnconfiguredCard reason={session.reason} />;
  if (
    !hasAnyRole(session, ["KULTUR_OWNER", "KULTUR_ADMIN", "KULTUR_OPERATOR"])
  ) {
    return <UnauthorizedCard title="Admin Access Required" />;
  }

  const options = await getWorkflowOptions();

  return (
    <div className={styles.page}>
      <Link className={styles.back} href="/app/admin">
        <ArrowLeft size={16} /> Admin command center
      </Link>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Festival infrastructure</p>
          <h1 className={styles.title}>Events &amp; venues</h1>
          <p className={styles.description}>
            Register physical venues, create Ganesh Puja event instances, then
            link them together. Registered so far: {options.venues.length}{" "}
            venues · {options.events.length} events ·{" "}
            {options.eventVenues.length} event venues.
          </p>
        </div>
      </header>
      <div className={styles.grid}>
        <FormSurface
          formKey="event"
          title="Create event"
          description="An event belongs to the venue organizer organization that runs it."
          fields={[
            {
              name: "organizerId",
              label: "Venue organizer",
              type: "select",
              options: options.organizers,
            },
            {
              name: "name",
              label: "Event name",
              type: "text",
              placeholder: "Saheed Nagar Ganesh Puja 2026",
            },
            { name: "startsAt", label: "Starts at", type: "datetime-local" },
            { name: "endsAt", label: "Ends at", type: "datetime-local" },
          ]}
          action={createEvent}
          submitLabel="Create event"
          query={query}
        />
        <FormSurface
          formKey="venue"
          title="Register venue"
          description="A venue is a permanent physical location that can host events year after year."
          fields={[
            {
              name: "name",
              label: "Venue name",
              type: "text",
              placeholder: "Saheed Nagar Pandal",
            },
            { name: "address", label: "Address", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "state", label: "State", type: "text" },
          ]}
          action={createVenue}
          submitLabel="Register venue"
          query={query}
        />
      </div>
      <FormSurface
        formKey="link"
        title="Link venue to event"
        description="Creates the event venue record that activations, batches, and live updates attach to."
        fields={[
          {
            name: "eventId",
            label: "Event",
            type: "select",
            options: options.events,
          },
          {
            name: "venueId",
            label: "Venue",
            type: "select",
            options: options.venues,
          },
          {
            name: "label",
            label: "Area label",
            type: "text",
            placeholder: "Main Pandal",
          },
          {
            name: "isPrimary",
            label: "Primary venue for this event",
            type: "checkbox",
          },
        ]}
        action={linkEventVenue}
        submitLabel="Link venue"
        query={query}
      />
    </div>
  );
}
