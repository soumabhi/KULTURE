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
import {
  createActivation,
  createCampaign,
  createCampaignConfig,
} from "../workflow-actions";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<FormQuery>;
}) {
  const session = await requireSession("/app/admin/campaigns");
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
          <p className={styles.eyebrow}>Commercial planning</p>
          <h1 className={styles.title}>Campaign studio</h1>
          <p className={styles.description}>
            Create the advertiser agreement, configure what guests see, and
            activate the campaign at event venues. Registered:{" "}
            {options.campaigns.length} campaigns · {options.activations.length}{" "}
            activations.
          </p>
        </div>
      </header>
      <div className={styles.grid}>
        <FormSurface
          formKey="campaign"
          title="Create campaign"
          description="The commercial agreement between Kultur and one advertiser."
          fields={[
            {
              name: "advertiserId",
              label: "Advertiser",
              type: "select",
              options: options.advertisers,
            },
            {
              name: "name",
              label: "Campaign name",
              type: "text",
              placeholder: "DN Homes Ganesh Puja 2026",
            },
            { name: "startsAt", label: "Starts at", type: "datetime-local" },
            { name: "endsAt", label: "Ends at", type: "datetime-local" },
          ]}
          action={createCampaign}
          submitLabel="Create campaign"
          query={query}
        />
        <FormSurface
          formKey="config"
          title="Configure guest experience"
          description="Controls the scan page: title, message, and sponsor identity."
          fields={[
            {
              name: "campaignId",
              label: "Campaign",
              type: "select",
              options: options.campaigns,
            },
            {
              name: "title",
              label: "Experience title",
              type: "text",
              placeholder: "Celebrate Ganesh Puja with DN Homes",
            },
            { name: "subtitle", label: "Subtitle", type: "text" },
            {
              name: "sponsorName",
              label: "Sponsor display name",
              type: "text",
            },
          ]}
          action={createCampaignConfig}
          submitLabel="Save configuration"
          query={query}
        />
      </div>
      <FormSurface
        formKey="activation"
        title="Activate at a venue"
        description="One activation per physical venue where this campaign runs."
        fields={[
          {
            name: "campaignId",
            label: "Campaign",
            type: "select",
            options: options.campaigns,
          },
          {
            name: "eventId",
            label: "Event",
            type: "select",
            options: options.events,
          },
          {
            name: "eventVenueId",
            label: "Event venue",
            type: "select",
            options: options.eventVenues,
          },
          {
            name: "name",
            label: "Activation name",
            type: "text",
            placeholder: "Saheed Nagar Main Pandal",
          },
          { name: "startsAt", label: "Starts at", type: "datetime-local" },
          { name: "endsAt", label: "Ends at", type: "datetime-local" },
        ]}
        action={createActivation}
        submitLabel="Create activation"
        query={query}
      />
    </div>
  );
}
