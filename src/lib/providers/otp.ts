import { createHash, randomInt } from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_SECONDS = 600;

export function generateOtpCode(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

/**
 * The OTP hash is salted with the claim token so a database read alone can
 * never recover a usable code. The raw code never touches the database.
 */
export function hashOtpCode(code: string, claimToken: string): string {
  return createHash("sha256").update(`${claimToken}:${code}`).digest("hex");
}

export function hashPhone(phoneE164: string): string {
  const pepper = process.env.KULTUR_PHONE_HASH_PEPPER ?? "";
  return createHash("sha256").update(`${pepper}:${phoneE164}`).digest("hex");
}

/**
 * Normalizes Indian mobile input to E.164. A bare 10-digit mobile number is
 * treated as +91; anything already in E.164 passes through unchanged.
 */
export function normalizePhoneE164(input: string): string | null {
  const compact = input.replace(/[\s()-]/g, "");
  if (/^[6-9]\d{9}$/.test(compact)) {
    return `+91${compact}`;
  }
  if (/^\+[1-9]\d{7,14}$/.test(compact)) {
    return compact;
  }
  return null;
}

export type OtpDelivery =
  | { ok: true; channel: "msg91" | "webhook" | "development-log" }
  | { ok: false; reason: string };

/**
 * MSG91 OTP API (v5) with a KULTUR-generated code. Verification stays
 * in-house (salted hash), so MSG91 is purely the SMS transport. Mobile must
 * be sent without the leading "+" (e.g. 919876543210).
 */
async function deliverViaMsg91(
  phoneE164: string,
  code: string,
): Promise<OtpDelivery> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  if (!authKey || !templateId) {
    return { ok: false, reason: "MSG91 is not configured" };
  }

  const mobile = phoneE164.replace(/^\+/, "");

  try {
    const response = await fetch("https://control.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        authkey: authKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile,
        otp: code,
        otp_expiry: String(Math.ceil(OTP_TTL_SECONDS / 60)),
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      type?: string;
      message?: string;
    } | null;

    if (!response.ok || payload?.type === "error") {
      return {
        ok: false,
        reason: payload?.message ?? `MSG91 responded with ${response.status}`,
      };
    }

    return { ok: true, channel: "msg91" };
  } catch {
    return { ok: false, reason: "MSG91 is unreachable" };
  }
}

/**
 * Delivery priority: MSG91 -> generic webhook -> development console.
 * In production a missing provider is a hard failure, never a silent skip.
 */
export async function deliverOtpCode(
  phoneE164: string,
  code: string,
): Promise<OtpDelivery> {
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_OTP_TEMPLATE_ID) {
    return deliverViaMsg91(phoneE164, code);
  }

  const webhookUrl = process.env.KULTUR_OTP_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.KULTUR_OTP_WEBHOOK_SECRET
            ? {
                authorization: `Bearer ${process.env.KULTUR_OTP_WEBHOOK_SECRET}`,
              }
            : {}),
        },
        body: JSON.stringify({
          to: phoneE164,
          code,
          purpose: "KULTUR_CLAIM_OTP",
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          reason: `OTP provider responded with ${response.status}`,
        };
      }
      return { ok: true, channel: "webhook" };
    } catch {
      return { ok: false, reason: "OTP provider is unreachable" };
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.info(`[kultur][otp] development delivery to ${phoneE164}: ${code}`);
    return { ok: true, channel: "development-log" };
  }

  return { ok: false, reason: "OTP provider is not configured" };
}
