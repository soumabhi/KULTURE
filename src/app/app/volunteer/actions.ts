"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const path = "/app/volunteer";

export async function completeAssignment(formData: FormData): Promise<void> {
  const session = await requireSession(path);

  if (session.state === "unconfigured" || !getSupabasePublicConfig()) {
    redirect(
      `${path}?error=${encodeURIComponent("Supabase is not configured.")}`,
    );
  }

  if (!hasAnyRole(session, ["KULTUR_VOLUNTEER"])) {
    redirect(
      `${path}?error=${encodeURIComponent("Only volunteer members can complete assignments.")}`,
    );
  }

  const parsed = z.string().uuid().safeParse(formData.get("assignmentId"));
  if (!parsed.success) {
    redirect(`${path}?error=${encodeURIComponent("Invalid assignment.")}`);
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("volunteer_assignments")
    .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .eq("volunteer_user_id", session.user.id)
    .neq("status", "COMPLETED");

  if (error) {
    redirect(`${path}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(path);
  redirect(`${path}?created=complete`);
}
