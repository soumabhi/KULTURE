"use client";

import { useActionState } from "react";
import KeycapButton from "@/components/keycap-button";
import styles from "@/components/platform/resource-page.module.css";
import { redeemVoucherAction } from "./actions";

export function RedeemForm() {
  const [state, formAction, pending] = useActionState(
    redeemVoucherAction,
    null,
  );

  return (
    <form action={formAction} className={styles.form}>
      <label className={styles.label}>
        Voucher code
        <input
          className={styles.input}
          name="voucherCode"
          required
          placeholder="KULTUR-XXX-000000"
          autoComplete="off"
          style={{ textTransform: "uppercase" }}
        />
      </label>
      {state ? (
        <p
          className={`${styles.notice} ${state.ok ? styles.success : styles.error}`}
          style={{ margin: 0 }}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <KeycapButton type="submit" disabled={pending}>
        {pending ? "Checking…" : "Validate & redeem"}
      </KeycapButton>
    </form>
  );
}
