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
import { createBatch } from "../workflow-actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import stylesTable from "@/components/platform/table.module.css";
import { updateBatch } from "../workflow-actions";
import BatchEditForm from "@/components/admin/batch-edit-form";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: any;
}) {
  const session = await requireSession("/app/admin/production");
  const query = await searchParams;
  if (session.state === "unconfigured")
    return <UnconfiguredCard reason={session.reason} />;
  if (
    !hasAnyRole(session, ["KULTUR_OWNER", "KULTUR_ADMIN", "KULTUR_OPERATOR"])
  ) {
    return <UnauthorizedCard title="Admin Access Required" />;
  }

  const options = await getWorkflowOptions();
  const supabase = await getSupabaseServerClient();

  // Pagination & search
  const params = query;
  const page = Number(params?.page) || 1;
  const pageSize = 10;
  const q = (params?.q as string) || "";

  const baseQuery = supabase.from("production_batches");
  const countQuery = q
    ? baseQuery
        .select("id", { count: "exact", head: true })
        .ilike("batch_code", `%${q}%`)
    : baseQuery.select("id", { count: "exact", head: true });

  const countRes = await countQuery;
  const total = (countRes as any).count ?? 0;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data: batches } = await supabase
    .from("production_batches")
    .select(
      `id, batch_code, quantity, produced_quantity, status, distributed_quantity, reserved_quantity, redeemed_quantity, created_at`,
    )
    .order("created_at", { ascending: false })
    .range(start, end)
    .ilike("batch_code", `%${q}%`);

  // Build preserved query params for pagination links
  const spBase = new URLSearchParams();
  if (q) spBase.set("q", q);
  const maybe = params as any;
  if (maybe?.created) spBase.set("created", maybe.created);
  if (maybe?.form) spBase.set("form", maybe.form);
  if (maybe?.error) spBase.set("error", maybe.error);
  const prevHref = (() => {
    const s = new URLSearchParams(spBase.toString());
    s.set("page", String(Math.max(1, page - 1)));
    return `?${s.toString()}`;
  })();
  const nextHref = (() => {
    const s = new URLSearchParams(spBase.toString());
    s.set("page", String(page + 1));
    return `?${s.toString()}`;
  })();

  return (
    <div className={styles.page}>
      <Link className={styles.back} href="/app/admin">
        <ArrowLeft size={16} /> Admin command center
      </Link>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Field delivery</p>
          <h1 className={styles.title}>Production desk</h1>
          <p className={styles.description}>
            Create the batch whose code is printed into the QR URL. One batch,
            one QR, many bottles — uniqueness comes from the verified guest, not
            the bottle. The scan link becomes{" "}
            <code>/scan/&lt;batch-code&gt;</code> once the batch is set to
            ACTIVE.
          </p>
        </div>
      </header>
      <FormSurface
        formKey="batch"
        title="Create production batch"
        description="Choose the confirmed campaign activation this batch will be distributed at."
        fields={[
          {
            name: "activationId",
            label: "Campaign activation",
            type: "select",
            options: options.activations,
          },
          {
            name: "batchCode",
            label: "Batch code (non-sequential, e.g. GN26-SN-A8K4)",
            type: "text",
            pattern: "[A-Z0-9]{2,}-[A-Z0-9]{2,}-[A-Z0-9]{4,}",
            placeholder: "GN26-SN-A8K4",
          },
          {
            name: "quantity",
            label: "Planned bottle quantity",
            type: "number",
            min: 1,
          },
          {
            name: "producedQuantity",
            label: "Produced quantity (optional)",
            type: "number",
            min: 0,
          },
        ]}
        action={createBatch}
        submitLabel="Create production batch"
        query={query}
      />
      <section className={styles.surface}>
        <h2 className={styles.surfaceTitle}>Existing batches</h2>
        <p className={styles.formDescription}>
          Edit operational quantities for an active batch.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <form
            method="get"
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <input
              name="q"
              defaultValue={(query as any)?.q ?? ""}
              placeholder="Search batch code"
            />
            <button type="submit">Search</button>
          </form>
          <div>
            Page {page} of {Math.max(1, Math.ceil((total ?? 0) / pageSize))}
          </div>
        </div>
        <div className={stylesTable.tableWrap}>
          <table className={stylesTable.table}>
            <thead>
              <tr>
                <th>Batch</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Distributed</th>
                <th>Reserved</th>
                <th>Redeemed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(batches ?? []).map((b: any) => (
                <tr key={b.id}>
                  <td>{b.batch_code}</td>
                  <td>{b.quantity}</td>
                  <td>{b.produced_quantity ?? "-"}</td>
                  <td>{b.distributed_quantity ?? 0}</td>
                  <td>{b.reserved_quantity ?? 0}</td>
                  <td>{b.redeemed_quantity ?? 0}</td>
                  <td>
                    <BatchEditForm
                      id={b.id}
                      quantity={b.quantity}
                      distributed={b.distributed_quantity ?? 0}
                      reserved={b.reserved_quantity ?? 0}
                      redeemed={b.redeemed_quantity ?? 0}
                      action={updateBatch}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.75rem",
          }}
        >
          <div>{page > 1 ? <Link href={prevHref}>Previous</Link> : null}</div>
          <div>
            {end + 1 < (total ?? 0) ? <Link href={nextHref}>Next</Link> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
