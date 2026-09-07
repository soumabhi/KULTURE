import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type SelectOption = { id: string; label: string };

export type WorkflowOptions = {
  organizations: SelectOption[];
  organizers: SelectOption[];
  advertisers: SelectOption[];
  events: SelectOption[];
  venues: SelectOption[];
  eventVenues: SelectOption[];
  campaigns: SelectOption[];
  activations: SelectOption[];
};

const emptyOptions: WorkflowOptions = {
  organizations: [],
  organizers: [],
  advertisers: [],
  events: [],
  venues: [],
  eventVenues: [],
  campaigns: [],
  activations: [],
};

export async function getWorkflowOptions(): Promise<WorkflowOptions> {
  if (!getSupabasePublicConfig()) {
    return emptyOptions;
  }

  const supabase = await getSupabaseServerClient();
  const [
    organizations,
    organizers,
    advertisers,
    events,
    venues,
    eventVenues,
    campaigns,
    activations,
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("status", "ACTIVE")
      .order("name"),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("organization_type", "VENUE_ORGANIZER")
      .eq("status", "ACTIVE")
      .order("name"),
    supabase
      .from("organizations")
      .select("id, name")
      .eq("organization_type", "ADVERTISER")
      .eq("status", "ACTIVE")
      .order("name"),
    supabase
      .from("events")
      .select("id, name")
      .order("starts_at", { ascending: false }),
    supabase.from("venues").select("id, name").order("name"),
    supabase
      .from("event_venues")
      .select("id, label")
      .order("created_at", { ascending: false }),
    supabase
      .from("campaigns")
      .select("id, name")
      .order("created_at", { ascending: false }),
    supabase
      .from("campaign_activations")
      .select("id, name")
      .order("starts_at", { ascending: false }),
  ]);

  const results = [
    organizations,
    organizers,
    advertisers,
    events,
    venues,
    eventVenues,
    campaigns,
    activations,
  ];
  if (results.some((result) => result.error)) {
    throw new Error("Could not load workflow options.");
  }

  const toOptions = (
    rows: Array<{ id: string; name?: string; label?: string }> | null,
  ) =>
    (rows ?? []).map((row) => ({
      id: row.id,
      label: row.name ?? row.label ?? row.id,
    }));

  return {
    organizations: toOptions(organizations.data),
    organizers: toOptions(organizers.data),
    advertisers: toOptions(advertisers.data),
    events: toOptions(events.data),
    venues: toOptions(venues.data),
    eventVenues: toOptions(eventVenues.data),
    campaigns: toOptions(campaigns.data),
    activations: toOptions(activations.data),
  };
}
