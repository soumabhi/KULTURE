"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { PlatformRole } from "@/lib/auth/types";

const adminRoles = ["KULTUR_OWNER", "KULTUR_ADMIN", "KULTUR_OPERATOR"] as const;
const id = z.string().uuid();
const date = z.string().min(1);

const organizationRoles: PlatformRole[] = [
  "KULTUR_OWNER",
  "KULTUR_ADMIN",
  "KULTUR_OPERATOR",
  "KULTUR_VOLUNTEER",
  "ADVERTISER_ADMIN",
  "ADVERTISER_VIEWER",
  "VENUE_ADMIN",
  "VENUE_OPERATOR",
];

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireOperator(path: string) {
  const session = await requireSession(path);
  if (session.state === "unconfigured" || !hasAnyRole(session, adminRoles)) {
    redirect("/app/admin");
  }
  return session;
}

function fail(path: string, form: string, message: string): never {
  redirect(`${path}?form=${form}&error=${encodeURIComponent(message)}`);
}

function ok(path: string, form: string): never {
  revalidatePath(path);
  revalidatePath("/app/admin");
  redirect(`${path}?created=${form}`);
}

function toIso(value: string): string | null {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString();
}

export async function createVenue(formData: FormData) {
  const path = "/app/admin/events";
  const session = await requireOperator(path);
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(160),
      address: z.string().trim().min(3).max(400),
      city: z.string().trim().min(2).max(120),
      state: z.string().trim().min(2).max(120),
    })
    .safeParse({
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
    });
  if (!parsed.success)
    fail(path, "venue", "Enter a valid venue name and address.");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("venues").insert({
    name: parsed.data.name,
    slug: slug(parsed.data.name),
    address: parsed.data.address,
    city: parsed.data.city,
    state: parsed.data.state,
    country: "India",
  });
  if (error) fail(path, "venue", error.message);
  ok(path, "venue");
}

export async function createEvent(formData: FormData) {
  const path = "/app/admin/events";
  const session = await requireOperator(path);
  const parsed = z
    .object({
      organizerId: id,
      name: z.string().trim().min(2).max(160),
      startsAt: date,
      endsAt: date,
    })
    .safeParse({
      organizerId: formData.get("organizerId"),
      name: formData.get("name"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
    });
  if (!parsed.success)
    fail(path, "event", "Enter a valid organizer, name, and time range.");

  const startsAt = toIso(parsed.data.startsAt);
  const endsAt = toIso(parsed.data.endsAt);
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
    fail(path, "event", "The event must end after it starts.");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("events").insert({
    organizer_organization_id: parsed.data.organizerId,
    name: parsed.data.name,
    slug: slug(parsed.data.name),
    starts_at: startsAt,
    ends_at: endsAt,
  });
  if (error) fail(path, "event", error.message);
  ok(path, "event");
}

export async function linkEventVenue(formData: FormData) {
  const path = "/app/admin/events";
  await requireOperator(path);
  const parsed = z
    .object({
      eventId: id,
      venueId: id,
      label: z.string().trim().min(2).max(120),
    })
    .safeParse({
      eventId: formData.get("eventId"),
      venueId: formData.get("venueId"),
      label: formData.get("label"),
    });
  if (!parsed.success)
    fail(path, "link", "Choose an event, a venue, and a label.");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("event_venues").insert({
    event_id: parsed.data.eventId,
    venue_id: parsed.data.venueId,
    label: parsed.data.label,
    is_primary: formData.get("isPrimary") === "on",
  });
  if (error) fail(path, "link", error.message);
  ok(path, "link");
}

export async function createCampaign(formData: FormData) {
  const path = "/app/admin/campaigns";
  const session = await requireOperator(path);
  const parsed = z
    .object({
      advertiserId: id,
      name: z.string().trim().min(2).max(160),
      startsAt: date,
      endsAt: date,
    })
    .safeParse({
      advertiserId: formData.get("advertiserId"),
      name: formData.get("name"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
    });
  if (!parsed.success)
    fail(path, "campaign", "Enter a valid advertiser, name, and time range.");

  const startsAt = toIso(parsed.data.startsAt);
  const endsAt = toIso(parsed.data.endsAt);
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
    fail(path, "campaign", "The campaign must end after it starts.");
  }

  const kulturMembership = session.memberships.find((membership) =>
    (adminRoles as readonly string[]).includes(membership.role),
  );
  if (!kulturMembership) {
    fail(path, "campaign", "A Kultur organization membership is required.");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("campaigns").insert({
    kultur_organization_id: kulturMembership.organizationId,
    advertiser_organization_id: parsed.data.advertiserId,
    name: parsed.data.name,
    slug: slug(parsed.data.name),
    starts_at: startsAt,
    ends_at: endsAt,
    created_by: session.user.id,
  });
  if (error) fail(path, "campaign", error.message);
  ok(path, "campaign");
}

export async function createCampaignConfig(formData: FormData) {
  const path = "/app/admin/campaigns";
  await requireOperator(path);
  const parsed = z
    .object({
      campaignId: id,
      title: z.string().trim().min(2).max(200),
      subtitle: z.string().trim().max(400).optional().or(z.literal("")),
      sponsorName: z.string().trim().min(2).max(160),
    })
    .safeParse({
      campaignId: formData.get("campaignId"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
      sponsorName: formData.get("sponsorName"),
    });
  if (!parsed.success)
    fail(
      path,
      "config",
      "Choose a campaign and enter a title and sponsor name.",
    );

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("campaign_configs").insert({
    campaign_id: parsed.data.campaignId,
    title: parsed.data.title,
    subtitle: parsed.data.subtitle || null,
    sponsor_name: parsed.data.sponsorName,
    experience_type: "GANESH_PUJA",
    game_type: "CATCH_MODAK",
  });
  if (error) fail(path, "config", error.message);
  ok(path, "config");
}

export async function createActivation(formData: FormData) {
  const path = "/app/admin/campaigns";
  await requireOperator(path);
  const parsed = z
    .object({
      campaignId: id,
      eventId: id,
      eventVenueId: id,
      name: z.string().trim().min(2).max(160),
      startsAt: date,
      endsAt: date,
    })
    .safeParse({
      campaignId: formData.get("campaignId"),
      eventId: formData.get("eventId"),
      eventVenueId: formData.get("eventVenueId"),
      name: formData.get("name"),
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
    });
  if (!parsed.success)
    fail(
      path,
      "activation",
      "Choose the campaign, event, venue, and time range.",
    );

  const startsAt = toIso(parsed.data.startsAt);
  const endsAt = toIso(parsed.data.endsAt);
  if (!startsAt || !endsAt || new Date(endsAt) <= new Date(startsAt)) {
    fail(path, "activation", "The activation must end after it starts.");
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("campaign_activations").insert({
    campaign_id: parsed.data.campaignId,
    event_id: parsed.data.eventId,
    event_venue_id: parsed.data.eventVenueId,
    name: parsed.data.name,
    starts_at: startsAt,
    ends_at: endsAt,
  });
  if (error) fail(path, "activation", error.message);
  ok(path, "activation");
}

export async function createBatch(formData: FormData) {
  const path = "/app/admin/production";
  await requireOperator(path);
  const parsed = z
    .object({
      activationId: id,
      batchCode: z
        .string()
        .trim()
        .toUpperCase()
        // Non-sequential: must end with a random-looking 4+ char suffix.
        .regex(/^[A-Z0-9]{2,}-[A-Z0-9]{2,}-[A-Z0-9]{4,}$/),
      quantity: z.coerce.number().int().positive(),
      producedQuantity: z.coerce.number().int().nonnegative().optional(),
    })
    .safeParse({
      activationId: formData.get("activationId"),
      batchCode: formData.get("batchCode"),
      quantity: formData.get("quantity"),
      producedQuantity: formData.get("producedQuantity") || undefined,
    });
  if (!parsed.success) {
    fail(
      path,
      "batch",
      "Enter an activation, a non-sequential batch code (e.g. GN26-SN-A8K4), and a positive quantity.",
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("production_batches").insert({
    campaign_activation_id: parsed.data.activationId,
    batch_code: parsed.data.batchCode,
    quantity: parsed.data.quantity,
    produced_quantity: parsed.data.producedQuantity ?? parsed.data.quantity,
  });
  if (error) fail(path, "batch", error.message);
  ok(path, "batch");
}

export async function updateBatch(formData: FormData) {
  const path = "/app/admin/production";
  const session = await requireOperator(path);
  const parsed = z
    .object({
      id: id,
      distributedQuantity: z.coerce.number().int().nonnegative().optional(),
      reservedQuantity: z.coerce.number().int().nonnegative().optional(),
      redeemedQuantity: z.coerce.number().int().nonnegative().optional(),
      reason: z.string().trim().min(3),
    })
    .safeParse({
      id: formData.get("id"),
      distributedQuantity: formData.get("distributedQuantity"),
      reservedQuantity: formData.get("reservedQuantity"),
      redeemedQuantity: formData.get("redeemedQuantity"),
      reason: formData.get("reason"),
    });
  if (!parsed.success) {
    fail(path, "batch-update", "Invalid values for batch quantities.");
  }

  const supabase = await getSupabaseServerClient();
  // Fetch prior values for audit
  const { data: priorRows, error: priorErr } = await supabase
    .from("production_batches")
    .select("distributed_quantity, reserved_quantity, redeemed_quantity")
    .eq("id", parsed.data.id)
    .limit(1)
    .maybeSingle();
  if (priorErr) fail(path, "batch-update", priorErr.message);

  const updates = {
    distributed_quantity: parsed.data.distributedQuantity ?? 0,
    reserved_quantity: parsed.data.reservedQuantity ?? 0,
    redeemed_quantity: parsed.data.redeemedQuantity ?? 0,
  };

  const { error } = await supabase
    .from("production_batches")
    .update(updates)
    .eq("id", parsed.data.id);
  if (error) {
    // Surface DB/trigger error to the UI for the specific batch row
    redirect(
      `${path}?form=batch-update&error=${encodeURIComponent(error.message)}&batchId=${parsed.data.id}`,
    );
  }

  // Insert audit record
  const adj = {
    production_batch_id: parsed.data.id,
    adjusted_by: session.user.id,
    old_distributed: priorRows?.distributed_quantity ?? 0,
    old_reserved: priorRows?.reserved_quantity ?? 0,
    old_redeemed: priorRows?.redeemed_quantity ?? 0,
    new_distributed: updates.distributed_quantity,
    new_reserved: updates.reserved_quantity,
    new_redeemed: updates.redeemed_quantity,
    reason: parsed.data.reason,
  };
  const { error: adjErr } = await supabase
    .from("batch_adjustments")
    .insert(adj);
  if (adjErr) {
    redirect(
      `${path}?form=batch-update&error=${encodeURIComponent(adjErr.message)}&batchId=${parsed.data.id}`,
    );
  }
  // Redirect with created flag and batch id so UI can show inline success
  revalidatePath(path);
  revalidatePath("/app/admin");
  redirect(`${path}?created=batch-update&batchId=${parsed.data.id}`);
}

export async function addOrganizationMember(formData: FormData) {
  const path = "/app/admin/organizations";
  await requireOperator(path);
  const parsed = z
    .object({
      organizationId: id,
      userId: id,
      role: z.enum(organizationRoles as [PlatformRole, ...PlatformRole[]]),
    })
    .safeParse({
      organizationId: formData.get("organizationId"),
      userId: formData.get("userId"),
      role: formData.get("role"),
    });
  if (!parsed.success)
    fail(path, "member", "Choose an organization, a user id, and a role.");

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("organization_members").insert({
    organization_id: parsed.data.organizationId,
    user_id: parsed.data.userId,
    role: parsed.data.role,
  });
  if (error) fail(path, "member", error.message);
  ok(path, "member");
}
