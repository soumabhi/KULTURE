"use server";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  OTP_TTL_SECONDS,
  deliverOtpCode,
  generateOtpCode,
  hashOtpCode,
  hashPhone,
  normalizePhoneE164,
} from "@/lib/providers/otp";

const CLAIM_TOKEN_COOKIE = "kultur_claim_token";
const CLAIM_PHONE_COOKIE = "kultur_claim_phone";
const CLAIM_COOKIE_MAX_AGE = 30 * 60;

function claimPath(batchCode: string): string {
  return `/scan/${encodeURIComponent(batchCode)}/claim`;
}

function fail(batchCode: string, message: string, step?: "otp"): never {
  const stepQuery = step ? `&step=${step}` : "";
  redirect(
    `${claimPath(batchCode)}?error=${encodeURIComponent(message)}${stepQuery}`,
  );
}

/** Raw IPs never leave the edge: only the peppered hash reaches the database. */
async function hashClientIp(): Promise<string | null> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : null;
  if (!ip) return null;
  const pepper = process.env.KULTUR_PHONE_HASH_PEPPER ?? "";
  return createHash("sha256").update(`${pepper}:ip:${ip}`).digest("hex");
}

export async function requestClaimOtp(formData: FormData): Promise<void> {
  const batchCode = String(formData.get("batchCode") ?? "").trim();
  if (!batchCode) {
    redirect("/");
  }

  const phoneE164 = normalizePhoneE164(String(formData.get("phone") ?? ""));
  if (!phoneE164) {
    fail(
      batchCode,
      "Enter a valid mobile number, for example 9876543210 or +919876543210.",
    );
  }

  // "resend" is a continuation of an already-consented claim; the RPC keeps
  // the originally captured consent and only rotates the OTP.
  const isResend = formData.get("resend") === "1";
  const consentTerms = isResend || formData.get("consentTerms") === "on";
  if (!consentTerms) {
    fail(
      batchCode,
      "Please agree to the offer terms and privacy policy to continue.",
    );
  }
  const consentMarketing = formData.get("consentMarketing") === "on";

  if (!getSupabasePublicConfig()) {
    fail(batchCode, "The campaign service is not configured yet.");
  }

  const claimToken = randomUUID();
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("submit_public_claim", {
    input_batch_code: batchCode,
    input_phone_e164: phoneE164,
    input_phone_hash: hashPhone(phoneE164),
    input_claim_token: claimToken,
    input_otp_hash: hashOtpCode(code, claimToken),
    input_expires_at: expiresAt,
    input_consent_terms: consentTerms,
    input_consent_marketing: isResend ? null : consentMarketing,
    input_ip_hash: await hashClientIp(),
  });

  if (error) {
    fail(batchCode, error.message);
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    out_claim_id: string | null;
    out_state: string;
  } | null;

  if (
    !row ||
    row.out_state === "BATCH_NOT_ACTIVE" ||
    row.out_state === "ACTIVATION_NOT_ACTIVE"
  ) {
    fail(batchCode, "This batch is not active right now.");
  }

  if (row.out_state === "CAMPAIGN_NOT_ACTIVE") {
    fail(batchCode, "This campaign is not active right now.");
  }

  if (row.out_state === "ALREADY_CLAIMED") {
    fail(
      batchCode,
      "This number has already claimed the offer for this campaign.",
    );
  }

  if (row.out_state === "TERMS_REQUIRED") {
    fail(
      batchCode,
      "Please agree to the offer terms and privacy policy to continue.",
    );
  }

  if (row.out_state === "RATE_LIMITED_PHONE") {
    fail(
      batchCode,
      "Too many codes requested for this number. Please try again in an hour.",
    );
  }

  if (row.out_state === "RATE_LIMITED_IP") {
    fail(
      batchCode,
      "Too many requests from this network. Please try again later.",
    );
  }

  const delivery = await deliverOtpCode(phoneE164, code);
  if (!delivery.ok) {
    fail(batchCode, delivery.reason);
  }

  const cookieStore = await cookies();
  cookieStore.set(CLAIM_TOKEN_COOKIE, claimToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: CLAIM_COOKIE_MAX_AGE,
    path: "/",
  });
  cookieStore.set(CLAIM_PHONE_COOKIE, phoneE164, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: CLAIM_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect(`${claimPath(batchCode)}?step=otp`);
}

export async function verifyClaimOtp(formData: FormData): Promise<void> {
  const batchCode = String(formData.get("batchCode") ?? "").trim();
  if (!batchCode) {
    redirect("/");
  }

  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    fail(batchCode, "Enter the 6-digit code.", "otp");
  }

  const cookieStore = await cookies();
  const claimToken = cookieStore.get(CLAIM_TOKEN_COOKIE)?.value;
  if (!claimToken) {
    fail(
      batchCode,
      "Your verification session expired. Enter your number again.",
    );
  }

  if (!getSupabasePublicConfig()) {
    fail(batchCode, "The campaign service is not configured yet.", "otp");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.rpc("verify_public_otp", {
    input_claim_token: claimToken,
    input_otp_hash: hashOtpCode(code, claimToken),
  });

  if (error) {
    fail(batchCode, error.message, "otp");
  }

  const row = (Array.isArray(data) ? data[0] : data) as {
    out_success: boolean;
    out_message: string;
  } | null;

  if (!row?.out_success) {
    fail(batchCode, row?.out_message ?? "Verification failed.", "otp");
  }

  redirect(`${claimPath(batchCode)}?step=done`);
}

export async function resendClaimOtp(formData: FormData): Promise<void> {
  const batchCode = String(formData.get("batchCode") ?? "").trim();
  if (!batchCode) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const phoneE164 = cookieStore.get(CLAIM_PHONE_COOKIE)?.value;

  if (!phoneE164) {
    fail(batchCode, "Enter your number again to receive a new code.");
  }

  const resendForm = new FormData();
  resendForm.set("batchCode", batchCode);
  resendForm.set("phone", phoneE164);
  resendForm.set("resend", "1");
  await requestClaimOtp(resendForm);
}
