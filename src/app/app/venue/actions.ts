"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const VENUE_ROLES = ["VENUE_ADMIN", "VENUE_OPERATOR"] as const;
const path = "/app/venue";

function fail(message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function postVenueUpdate(formData: FormData): Promise<void> {
  const session = await requireSession(path);

  if (session.state === "unconfigured" || !getSupabasePublicConfig()) {
    fail("Supabase is not configured.");
  }

  if (!hasAnyRole(session, VENUE_ROLES)) {
    fail("Only venue roles can post live updates.");
  }

  const parsed = z
    .object({
      eventVenueId: z.string().uuid(),
      updateType: z.enum(["CROWD_STATUS", "ANNOUNCEMENT", "RESUPPLY_ALERT"]),
      title: z.string().trim().min(2).max(160),
      message: z.string().trim().max(500).optional().or(z.literal("")),
    })
    .safeParse({
      eventVenueId: formData.get("eventVenueId"),
      updateType: formData.get("updateType"),
      title: formData.get("title"),
      message: formData.get("message"),
    });

  if (!parsed.success) {
    fail("Choose an event venue and enter a valid update.");
  }

  const venueOrgIds = session.memberships
    .filter((membership) =>
      (VENUE_ROLES as readonly string[]).includes(membership.role),
    )
    .map((membership) => membership.organizationId);

  const supabase = await getSupabaseServerClient();

  const { data: eventVenue } = await supabase
    .from("event_venues")
    .select("event_id")
    .eq("id", parsed.data.eventVenueId)
    .maybeSingle();

  if (!eventVenue) {
    fail("Event venue not found.");
  }

  const { data: event } = await supabase
    .from("events")
    .select("organizer_organization_id")
    .eq("id", eventVenue.event_id)
    .maybeSingle();

  if (!event || !venueOrgIds.includes(event.organizer_organization_id)) {
    fail("This venue does not belong to your organization.");
  }

  const { error } = await supabase.from("venue_live_updates").insert({
    event_venue_id: parsed.data.eventVenueId,
    update_type: parsed.data.updateType,
    title: parsed.data.title,
    message: parsed.data.message || null,
    created_by: session.user.id,
  });

  if (error) {
    fail(error.message);
  }

  revalidatePath(path);
  redirect(`${path}?created=update`);
}
