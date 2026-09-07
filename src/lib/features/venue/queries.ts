import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type VenueWorkspaceData = {
  eventVenues: Array<{ id: string; label: string; eventName: string }>;
  updates: Array<{
    id: string;
    title: string;
    updateType: string;
    message: string | null;
    createdAt: string;
  }>;
};

const emptyWorkspace: VenueWorkspaceData = { eventVenues: [], updates: [] };

export async function getVenueWorkspace(
  organizationIds: string[],
): Promise<VenueWorkspaceData> {
  if (!getSupabasePublicConfig() || organizationIds.length === 0) {
    return emptyWorkspace;
  }

  const supabase = await getSupabaseServerClient();
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, name")
    .in("organizer_organization_id", organizationIds)
    .order("starts_at", { ascending: false });

  if (eventsError) {
    throw new Error("Could not load venue events.");
  }

  const eventRows = events ?? [];
  const eventIds = eventRows.map((event) => event.id);
  if (eventIds.length === 0) {
    return emptyWorkspace;
  }

  const { data: eventVenueRows, error: venuesError } = await supabase
    .from("event_venues")
    .select("id, label, event_id")
    .in("event_id", eventIds);

  if (venuesError) {
    throw new Error("Could not load event venues.");
  }

  const eventNameById = new Map(
    eventRows.map((event) => [event.id, event.name]),
  );
  const eventVenues = (eventVenueRows ?? []).map((eventVenue) => ({
    id: eventVenue.id,
    label: eventVenue.label,
    eventName: eventNameById.get(eventVenue.event_id) ?? "Event",
  }));

  const eventVenueIds = eventVenues.map((eventVenue) => eventVenue.id);
  if (eventVenueIds.length === 0) {
    return { eventVenues, updates: [] };
  }

  const { data: updateRows, error: updatesError } = await supabase
    .from("venue_live_updates")
    .select("id, title, update_type, message, created_at")
    .in("event_venue_id", eventVenueIds)
    .order("created_at", { ascending: false })
    .limit(10);

  if (updatesError) {
    throw new Error("Could not load live updates.");
  }

  return {
    eventVenues,
    updates: (updateRows ?? []).map((update) => ({
      id: update.id,
      title: update.title,
      updateType: update.update_type,
      message: update.message,
      createdAt: update.created_at,
    })),
  };
}
