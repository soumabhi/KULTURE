"use server";

import { hasAnyRole } from "@/lib/auth/authorization";
import { requireSession } from "@/lib/auth/route-guards";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RedeemState = {
  ok: boolean;
  message: string;
  redeemedAt: string | null;
} | null;

export async function redeemVoucherAction(
  _previous: RedeemState,
  formData: FormData,
): Promise<RedeemState> {
  const session = await requireSession("/app/advertiser");

  if (session.state === "unconfigured" || !getSupabasePublicConfig()) {
    return {
      ok: false,
      message: "Supabase is not configured.",
      redeemedAt: null,
    };
  }

  if (!hasAnyRole(session, ["ADVERTISER_ADMIN"])) {
    return {
      ok: false,
      message: "Only advertiser admins can redeem vouchers.",
      redeemedAt: null,
    };
  }

  const voucherCode = String(formData.get("voucherCode") ?? "")
    .trim()
    .toUpperCase();
  if (!voucherCode) {
    return { ok: false, message: "Enter a voucher code.", redeemedAt: null };
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("redeem_voucher", {
    input_voucher_code: voucherCode,
  });

  if (error) {
    return { ok: false, message: error.message, redeemedAt: null };
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    out_success: boolean;
    out_message: string;
    out_redeemed_at: string | null;
  } | null;

  if (!row?.out_success) {
    return {
      ok: false,
      message: row?.out_message ?? "Redemption failed.",
      redeemedAt: null,
    };
  }

  return {
    ok: true,
    message: row.out_message,
    redeemedAt: row.out_redeemed_at,
  };
}
