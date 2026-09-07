"use client";

import React, { useMemo, useState, useEffect } from "react";
import resourceStyles from "@/components/platform/resource-page.module.css";
import tableStyles from "@/components/platform/table.module.css";

type Props = {
  id: string;
  quantity: number;
  distributed?: number;
  reserved?: number;
  redeemed?: number;
  action: (formData: FormData) => Promise<void> | void;
};

export default function BatchEditForm({
  id,
  quantity,
  distributed = 0,
  reserved = 0,
  redeemed = 0,
  action,
}: Props) {
  const [d, setD] = useState<number>(distributed);
  const [r, setR] = useState<number>(reserved);
  const [rd, setRd] = useState<number>(redeemed);
  const [reason, setReason] = useState<string>("");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  const sum = useMemo(() => d + r + rd, [d, r, rd]);
  const exceeds = sum > quantity;
  const canSubmit = !exceeds && reason.trim().length > 0;

  useEffect(() => {
    // Read URL search params to surface row-level error/success messages
    try {
      const sp = new URLSearchParams(window.location.search);
      const batchId = sp.get("batchId");
      const form = sp.get("form");
      const err = sp.get("error");
      const created = sp.get("created");
      if (form === "batch-update" && batchId === id && err) {
        setInlineError(err);
      } else if (created === "batch-update" && batchId === id) {
        setInlineSuccess("Updated.");
      }
    } catch (e) {
      // ignore
    }
  }, [id]);

  return (
    <form action={action} className={resourceStyles.form}>
      <input type="hidden" name="id" value={id} />
      <label
        className={resourceStyles.label}
        style={{ display: "inline-block", marginRight: "0.5rem" }}
      >
        <span style={{ display: "none" }}>Distributed</span>
        <input
          className={resourceStyles.input}
          name="distributedQuantity"
          type="number"
          min={0}
          max={quantity}
          value={d}
          onChange={(e) => setD(Number(e.target.value || 0))}
          style={{ width: "6rem" }}
        />
      </label>
      <label
        className={resourceStyles.label}
        style={{ display: "inline-block", marginRight: "0.5rem" }}
      >
        <span style={{ display: "none" }}>Reserved</span>
        <input
          className={resourceStyles.input}
          name="reservedQuantity"
          type="number"
          min={0}
          max={quantity}
          value={r}
          onChange={(e) => setR(Number(e.target.value || 0))}
          style={{ width: "6rem" }}
        />
      </label>
      <label
        className={resourceStyles.label}
        style={{ display: "inline-block", marginRight: "0.5rem" }}
      >
        <span style={{ display: "none" }}>Redeemed</span>
        <input
          className={resourceStyles.input}
          name="redeemedQuantity"
          type="number"
          min={0}
          max={quantity}
          value={rd}
          onChange={(e) => setRd(Number(e.target.value || 0))}
          style={{ width: "6rem" }}
        />
      </label>
      <label
        className={resourceStyles.label}
        style={{ display: "inline-block", marginRight: "0.5rem" }}
      >
        <span style={{ display: "none" }}>Reason</span>
        <input
          className={resourceStyles.input}
          name="reason"
          type="text"
          placeholder="Reason (required)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ width: "14rem" }}
          required
        />
      </label>
      <button
        className={tableStyles.updateButton}
        type="submit"
        disabled={!canSubmit}
        title={
          !canSubmit
            ? exceeds
              ? "Sum exceeds planned quantity"
              : "Provide a reason"
            : "Update"
        }
      >
        Update
      </button>
      {inlineError ? (
        <p
          className={`${resourceStyles.notice} ${resourceStyles.error}`}
          style={{ marginTop: "0.35rem" }}
        >
          {inlineError}
        </p>
      ) : inlineSuccess ? (
        <p
          className={`${resourceStyles.notice} ${resourceStyles.success}`}
          style={{ marginTop: "0.35rem" }}
        >
          {inlineSuccess}
        </p>
      ) : exceeds ? (
        <div
          className={resourceStyles.error}
          style={{
            padding: "0.4rem",
            marginTop: "0.25rem",
            borderRadius: "6px",
          }}
        >
          Sum of distributed+reserved+redeemed ({sum}) exceeds planned quantity
          ({quantity}).
        </div>
      ) : null}
    </form>
  );
}
