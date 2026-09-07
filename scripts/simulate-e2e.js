// Simple E2E simulation script for KULTUR public flow
// Usage: set SUPABASE_URL and SUPABASE_ANON_KEY in env, then run: node scripts/simulate-e2e.js

const fetch = require("node-fetch");
const { v4: uuidv4 } = require("uuid");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // optional for redeem

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Please set SUPABASE_URL and SUPABASE_ANON_KEY in env");
  process.exit(1);
}

async function rpc(name, body, key = SUPABASE_ANON_KEY) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }
  return { status: res.status, body: json };
}

(async () => {
  try {
    // 1) pick an ACTIVE batch code from DB
    const batchesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/production_batches?select=batch_code&status=eq.ACTIVE&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );
    const batches = await batchesRes.json();
    if (!batches || batches.length === 0) {
      console.error("No active batches found. Create one in admin.");
      process.exit(2);
    }
    const batchCode = batches[0].batch_code;
    console.log("Using batchCode:", batchCode);

    // 2) Start claim: submit_public_claim
    // Require explicit test inputs to avoid hard-coded dummy values.
    const phone = process.env.SUPABASE_E2E_PHONE;
    const phone_hash = process.env.SUPABASE_E2E_PHONE_HASH;
    const claim_token = uuidv4();
    const otp_hash = process.env.SUPABASE_E2E_OTP_HASH;
    if (!phone || !phone_hash || !otp_hash) {
      console.error(
        "E2E simulation requires SUPABASE_E2E_PHONE, SUPABASE_E2E_PHONE_HASH and SUPABASE_E2E_OTP_HASH environment variables. Aborting.",
      );
      process.exit(2);
    }
    const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const submit = await rpc("submit_public_claim", {
      input_batch_code: batchCode,
      input_phone_e164: phone,
      input_phone_hash: phone_hash,
      input_claim_token: claim_token,
      input_otp_hash: otp_hash,
      input_expires_at: expires_at,
      input_consent_terms: true,
      input_consent_marketing: false,
    });
    console.log("submit_public_claim:", submit.status, submit.body);

    if (!submit.body || !submit.body[0] || !submit.body[0].out_state) {
      console.error("Unexpected submit response");
      process.exit(3);
    }
    if (submit.body[0].out_state !== "OTP_SENT") {
      console.error("Claim not progressed:", submit.body);
      process.exit(4);
    }

    // 3) Verify OTP: call verify_public_otp with same claim_token and otp_hash
    const verify = await rpc("verify_public_otp", {
      input_claim_token: claim_token,
      input_otp_hash: otp_hash,
    });
    console.log("verify_public_otp:", verify.status, verify.body);

    if (
      !verify.body ||
      !verify.body[0] ||
      verify.body[0].out_success !== true
    ) {
      console.error("Verification failed:", verify.body);
      process.exit(5);
    }

    const voucher = verify.body[0].out_voucher_code;
    console.log("Voucher issued:", voucher);

    // 4) Get public claim status
    const claimStatus = await rpc("get_public_claim", {
      input_claim_token: claim_token,
    });
    console.log("get_public_claim:", claimStatus.status, claimStatus.body);

    // 5) Attempt redeem using service key if provided
    if (SERVICE_KEY) {
      const redeem = await rpc(
        "redeem_voucher",
        { input_voucher_code: voucher, input_notes: "Simulated redeem" },
        SERVICE_KEY,
      );
      console.log("redeem_voucher (service key):", redeem.status, redeem.body);
    } else {
      console.log("No SERVICE_KEY provided; skipping redeem step.");
    }

    console.log("E2E simulation complete.");
  } catch (err) {
    console.error("Error during simulation", err);
    process.exit(99);
  }
})();
