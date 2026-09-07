import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type VolunteerAssignment = {
  id: string;
  taskType: string;
  status: string;
  assignedAt: string;
  batchCode: string | null;
  venueLabel: string | null;
};

type AssignmentRow = {
  id: string;
  task_type: string;
  status: string;
  assigned_at: string;
  production_batches: { batch_code: string } | { batch_code: string }[] | null;
  event_venues: { label: string } | { label: string }[] | null;
};

export async function getVolunteerAssignments(
  userId: string,
): Promise<VolunteerAssignment[]> {
  if (!getSupabasePublicConfig()) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("volunteer_assignments")
    .select(
      "id, task_type, status, assigned_at, production_batches(batch_code), event_venues(label)",
    )
    .eq("volunteer_user_id", userId)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error("Could not load volunteer assignments.");
  }

  return ((data as AssignmentRow[] | null) ?? []).map((assignment) => {
    const batch = Array.isArray(assignment.production_batches)
      ? assignment.production_batches[0]
      : assignment.production_batches;
    const venue = Array.isArray(assignment.event_venues)
      ? assignment.event_venues[0]
      : assignment.event_venues;
    return {
      id: assignment.id,
      taskType: assignment.task_type,
      status: assignment.status,
      assignedAt: assignment.assigned_at,
      batchCode: batch?.batch_code ?? null,
      venueLabel: venue?.label ?? null,
    };
  });
}
