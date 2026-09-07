"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  organizationType: z.enum(["KULTUR", "ADVERTISER", "VENUE_ORGANIZER"]),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(24).optional().or(z.literal("")),
});

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createOrganization(formData: FormData): Promise<void> {
  const session = await requireSession("/app/admin/organizations");
  if (
    session.state === "unconfigured" ||
    !hasAnyRole(session, ["KULTUR_OWNER", "KULTUR_ADMIN"])
  ) {
    redirect(
      "/app/admin/organizations?form=organization&error=You%20do%20not%20have%20permission%20to%20create%20organizations",
    );
  }

  const parsed = organizationSchema.safeParse({
    name: formData.get("name"),
    organizationType: formData.get("organizationType"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    redirect(
      "/app/admin/organizations?form=organization&error=Please%20provide%20a%20valid%20organization%20record",
    );
  }

  const supabase = await getSupabaseServerClient();
  const slug = toSlug(parsed.data.name);

  const { error } = await supabase.from("organizations").insert({
    name: parsed.data.name,
    slug,
    organization_type: parsed.data.organizationType,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  });

  if (error) {
    redirect(
      `/app/admin/organizations?form=organization&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/app/admin");
  revalidatePath("/app/admin/organizations");
  redirect("/app/admin/organizations?created=organization");
}
