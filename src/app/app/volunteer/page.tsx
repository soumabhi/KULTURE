import KeycapButton from "@/components/keycap-button";
import {
  UnauthorizedCard,
  UnconfiguredCard,
} from "@/components/platform/guard-cards";
import resource from "@/components/platform/resource-page.module.css";
import workspace from "@/components/platform/workspace.module.css";
import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getVolunteerAssignments } from "@/lib/features/volunteer/queries";
import { completeAssignment } from "./actions";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function VolunteerPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const session = await requireSession("/app/volunteer");
  const query = await searchParams;

  if (session.state === "unconfigured") {
    return <UnconfiguredCard reason={session.reason} />;
  }

  if (!hasAnyRole(session, ["KULTUR_VOLUNTEER"])) {
    return (
      <UnauthorizedCard
        title="Volunteer Access Required"
        description="Only volunteer members can view and complete assignments."
      />
    );
  }

  const assignments = await getVolunteerAssignments(session.user.id);

  return (
    <div className={workspace.page}>
      <section className={workspace.hero}>
        <div>
          <p className={workspace.eyebrow}>Volunteer workspace</p>
          <h1 className={workspace.title}>
            Know the next field move, clearly.
          </h1>
          <p className={workspace.description}>
            Assignments are scoped to your identity. Confirm completion when the
            batch is delivered or the setup is done.
          </p>
        </div>
      </section>

      <section className={resource.surface}>
        <h2 className={resource.surfaceTitle}>Your assignments</h2>
        {query.created === "complete" ? (
          <p className={`${resource.notice} ${resource.success}`}>
            Assignment completed. Great work.
          </p>
        ) : null}
        {query.error ? (
          <p className={`${resource.notice} ${resource.error}`}>
            {query.error}
          </p>
        ) : null}
        {assignments.length === 0 ? (
          <p className={resource.empty}>
            Nothing assigned yet. Kultur operations will assign delivery, setup,
            or resupply tasks to you here.
          </p>
        ) : (
          <ul className={resource.list}>
            {assignments.map((assignment) => (
              <li className={resource.item} key={assignment.id}>
                <div>
                  <p className={resource.itemTitle}>
                    {assignment.taskType}
                    {assignment.batchCode ? ` · ${assignment.batchCode}` : ""}
                  </p>
                  <p className={resource.itemCopy}>
                    {assignment.venueLabel ? `${assignment.venueLabel} · ` : ""}
                    Assigned{" "}
                    {dateFormatter.format(new Date(assignment.assignedAt))}
                  </p>
                </div>
                {assignment.status === "COMPLETED" ? (
                  <span className={resource.badge}>COMPLETED</span>
                ) : (
                  <form action={completeAssignment}>
                    <input
                      type="hidden"
                      name="assignmentId"
                      value={assignment.id}
                    />
                    <KeycapButton type="submit">Mark completed</KeycapButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
