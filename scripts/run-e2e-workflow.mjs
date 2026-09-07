#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv(file = ".env.local") {
  const p = path.resolve(process.cwd(), file);
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx);
    let v = trimmed.slice(idx + 1);
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    process.env[k] = v;
  }
}

async function run() {
  loadDotEnv();
  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env (.env.local)",
    );
    process.exit(2);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const report = { created: {}, errors: [] };

  try {
    console.log("1) Ensure kultur org exists");
    const orgRes = await admin
      .from("organizations")
      .select("id")
      .eq("slug", "kultur")
      .limit(1);
    let kulturOrgId = orgRes.data?.[0]?.id;
    if (!kulturOrgId) {
      const ins = await admin
        .from("organizations")
        .insert({
          name: "Kultur",
          slug: "kultur",
          organization_type: "KULTUR",
          status: "ACTIVE",
        })
        .select("id")
        .limit(1);
      kulturOrgId = ins.data?.[0]?.id;
      report.created.kulturOrg = kulturOrgId;
    }
    console.log("kultur org id:", kulturOrgId);

    // Create test advertiser org (idempotent)
    console.log("2) Create advertiser and venue orgs");
    let advertiserOrgId;
    const advSel = await admin
      .from("organizations")
      .select("id")
      .eq("slug", "advertiser-test")
      .limit(1);
    if (advSel.data && advSel.data.length > 0)
      advertiserOrgId = advSel.data[0].id;
    else {
      const { data: adv } = await admin
        .from("organizations")
        .insert({
          name: "Advertiser Test",
          slug: "advertiser-test",
          organization_type: "ADVERTISER",
          status: "ACTIVE",
        })
        .select("id")
        .limit(1);
      advertiserOrgId = adv?.[0]?.id;
    }

    let venueOrgId;
    const venueSel = await admin
      .from("organizations")
      .select("id")
      .eq("slug", "venue-test")
      .limit(1);
    if (venueSel.data && venueSel.data.length > 0)
      venueOrgId = venueSel.data[0].id;
    else {
      const { data: venueOrg } = await admin
        .from("organizations")
        .insert({
          name: "Venue Test",
          slug: "venue-test",
          organization_type: "VENUE_ORGANIZER",
          status: "ACTIVE",
        })
        .select("id")
        .limit(1);
      venueOrgId = venueOrg?.[0]?.id;
    }
    report.created.advertiserOrgId = advertiserOrgId;
    report.created.venueOrgId = venueOrgId;
    console.log({ advertiserOrgId, venueOrgId });

    // Create test users for roles
    console.log("3) Create test users (admin/advertiser/venue/volunteer)");
    const users = {};
    const roles = [
      { key: "admin", email: "e2e-admin@example.test" },
      { key: "advertiser", email: "e2e-advertiser@example.test" },
      { key: "venue", email: "e2e-venue@example.test" },
      { key: "volunteer", email: "e2e-volunteer@example.test" },
    ];
    for (const r of roles) {
      // idempotent user creation: check profiles by email first
      const prof = await admin
        .from("profiles")
        .select("id")
        .eq("email", r.email)
        .limit(1);
      if (prof.data && prof.data.length > 0) {
        const uid = prof.data[0].id;
        users[r.key] = { id: uid, email: r.email };
      } else {
        const res = await admin.auth.admin.createUser({
          email: r.email,
          password: "E2eTestPass!23",
          email_confirm: true,
        });
        if (res.error) throw res.error;
        const uid = res.data?.user?.id ?? res.data?.id;
        users[r.key] = { id: uid, email: r.email };
        // upsert profile
        await admin
          .from("profiles")
          .upsert(
            { id: uid, email: r.email, full_name: `${r.key} test` },
            { onConflict: "id" },
          );
      }
    }
    report.created.users = users;
    console.log("created users", users);

    // Assign membership roles
    console.log("4) Create organization_members for roles");
    await admin
      .from("organization_members")
      .insert({
        organization_id: kulturOrgId,
        user_id: users.admin.id,
        role: "KULTUR_OWNER",
        status: "ACTIVE",
      });
    await admin
      .from("organization_members")
      .insert({
        organization_id: advertiserOrgId,
        user_id: users.advertiser.id,
        role: "ADVERTISER_ADMIN",
        status: "ACTIVE",
      });
    await admin
      .from("organization_members")
      .insert({
        organization_id: venueOrgId,
        user_id: users.venue.id,
        role: "VENUE_ADMIN",
        status: "ACTIVE",
      });
    await admin
      .from("organization_members")
      .insert({
        organization_id: kulturOrgId,
        user_id: users.volunteer.id,
        role: "KULTUR_VOLUNTEER",
        status: "ACTIVE",
      });
    console.log("memberships inserted");

    // Create an event and venue record for activation (idempotent)
    console.log("5) Create venue and event for campaign activation");
    let venueId;
    const vSel = await admin
      .from("venues")
      .select("id")
      .eq("slug", "e2e-venue")
      .limit(1);
    if (vSel.data && vSel.data.length > 0) venueId = vSel.data[0].id;
    else {
      const { data: venueData } = await admin
        .from("venues")
        .insert({
          name: "E2E Venue",
          slug: "e2e-venue",
          address: "123 Test St",
          city: "TestCity",
          state: "TS",
          country: "India",
        })
        .select("id")
        .limit(1);
      venueId = venueData?.[0]?.id;
    }

    let eventId;
    const eSel = await admin
      .from("events")
      .select("id")
      .eq("slug", "e2e-event")
      .limit(1);
    if (eSel.data && eSel.data.length > 0) eventId = eSel.data[0].id;
    else {
      const { data: eventData } = await admin
        .from("events")
        .insert({
          organizer_organization_id: kulturOrgId,
          name: "E2E Event",
          slug: "e2e-event",
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 3600 * 1000).toISOString(),
        })
        .select("id")
        .limit(1);
      eventId = eventData?.[0]?.id;
    }

    let eventVenueId;
    const evSel = await admin
      .from("event_venues")
      .select("id")
      .eq("event_id", eventId)
      .eq("venue_id", venueId)
      .limit(1);
    if (evSel.data && evSel.data.length > 0) eventVenueId = evSel.data[0].id;
    else {
      const { data: eventVenue } = await admin
        .from("event_venues")
        .insert({
          event_id: eventId,
          venue_id: venueId,
          label: "Main",
          is_primary: true,
        })
        .select("id")
        .limit(1);
      eventVenueId = eventVenue?.[0]?.id;
    }
    report.created.venueId = venueId;
    report.created.eventId = eventId;

    // Create campaign and activation
    console.log("6) Create campaign, config and activation");
    // Create campaign and activation (idempotent)
    console.log("6) Create campaign, config and activation");
    let campaignId;
    const cSel = await admin
      .from("campaigns")
      .select("id")
      .eq("slug", "e2e-campaign")
      .limit(1);
    if (cSel.data && cSel.data.length > 0) campaignId = cSel.data[0].id;
    else {
      const { data: campaignData } = await admin
        .from("campaigns")
        .insert({
          kultur_organization_id: kulturOrgId,
          advertiser_organization_id: advertiserOrgId,
          name: "E2E Campaign",
          slug: "e2e-campaign",
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          created_by: users.admin.id,
        })
        .select("id")
        .limit(1);
      campaignId = campaignData?.[0]?.id;
    }
    // campaign_config
    const confSel = await admin
      .from("campaign_configs")
      .select("id")
      .eq("campaign_id", campaignId)
      .limit(1);
    if (!(confSel.data && confSel.data.length > 0))
      await admin
        .from("campaign_configs")
        .insert({ campaign_id: campaignId, title: "E2E Campaign Title" });

    let activationId;
    const aSel = await admin
      .from("campaign_activations")
      .select("id")
      .eq("campaign_id", campaignId)
      .limit(1);
    if (aSel.data && aSel.data.length > 0) activationId = aSel.data[0].id;
    else {
      const { data: activationData } = await admin
        .from("campaign_activations")
        .insert({
          campaign_id: campaignId,
          event_id: eventId,
          event_venue_id: eventVenueId,
          name: "E2E Activation",
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        })
        .select("id")
        .limit(1);
      activationId = activationData?.[0]?.id;
    }
    report.created.campaignId = campaignId;
    report.created.activationId = activationId;

    // Create production batch
    console.log("7) Create production batch");
    const batchSlug = "e2e-batch";
    const bSel = await admin
      .from("production_batches")
      .select("id,batch_code")
      .eq("batch_code", batchSlug)
      .limit(1);
    let batchId, batchCode;
    if (bSel.data && bSel.data.length > 0) {
      batchId = bSel.data[0].id;
      batchCode = bSel.data[0].batch_code;
    } else {
      const code = batchSlug; // use stable code
      const { data: batchData } = await admin
        .from("production_batches")
        .insert({
          campaign_activation_id: activationId,
          batch_code: code,
          quantity: 100,
          status: "ACTIVE",
        })
        .select("id,batch_code")
        .limit(1);
      batchId = batchData?.[0]?.id;
      batchCode = batchData?.[0]?.batch_code;
    }
    report.created.batchId = batchId;
    report.created.batchCode = batchCode;

    // Simulate a scan session and claim
    console.log(
      "8) Simulate scan session and claim for volunteer (phone absent, simulate claim)",
    );
    const { data: scanSession } = await admin
      .from("scan_sessions")
      .insert({
        production_batch_id: batchId,
        campaign_activation_id: activationId,
        user_agent: "e2e-agent",
        ip_hash: "e2e",
      })
      .select("id")
      .limit(1);
    const scanSessionId = scanSession?.[0]?.id;
    const phoneHash = "+911234567890"; // example - not validated here
    // insert claim
    const { data: claimData } = await admin
      .from("claims")
      .insert({
        campaign_id: campaignId,
        production_batch_id: batchId,
        scan_session_id: scanSessionId,
        phone_e164: phoneHash,
        phone_hash: "e2ehash",
        verification_status: "VERIFIED",
        status: "VOUCHER_ISSUED",
      })
      .select("id")
      .limit(1);
    const claimId = claimData?.[0]?.id;
    report.created.claimId = claimId;

    // Create voucher
    console.log("9) Create voucher for claim");
    const voucherCode = `E2E-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const vSel2 = await admin
      .from("vouchers")
      .select("id")
      .eq("voucher_code", voucherCode)
      .limit(1);
    if (vSel2.data && vSel2.data.length > 0)
      report.created.voucherId = vSel2.data[0].id;
    else {
      const { data: voucherData } = await admin
        .from("vouchers")
        .insert({
          campaign_id: campaignId,
          claim_id: claimId,
          voucher_code: voucherCode,
        })
        .select("id")
        .limit(1);
      report.created.voucherId = voucherData?.[0]?.id;
    }
    report.created.voucherCode = voucherCode;

    console.log("E2E flow created:", report.created);
    console.log("10) Role-based checks using publishable key and sign-in");
    // sign-in and perform role checks
    const PUB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!PUB_KEY) {
      report.errors.push(
        "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local; skipping role checks",
      );
    } else {
      const { createClient } = await import("@supabase/supabase-js");
      const anonClient = createClient(SUPABASE_URL, PUB_KEY, {
        auth: { persistSession: false },
      });

      async function signInAndClient(email) {
        const r = await anonClient.auth.signInWithPassword({
          email,
          password: "E2eTestPass!23",
        });
        if (r.error) throw r.error;
        const token = r.data.session.access_token;
        // client that will send Authorization header with user's token
        const userClient = createClient(SUPABASE_URL, PUB_KEY, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false },
        });
        return { r, token, userClient };
      }

      // Admin checks
      try {
        const adminSign = await signInAndClient(
          report.created.users.admin.email,
        );
        const adminClient = adminSign.userClient;
        const orgsRes = await adminClient
          .from("organizations")
          .select("id,slug")
          .limit(5);
        report.roleChecks = report.roleChecks || {};
        report.roleChecks.admin = {
          orgsCount: orgsRes.data?.length ?? 0,
          error: orgsRes.error?.message ?? null,
        };
        // try creating a campaign as admin
        const createCamp = await adminClient
          .from("campaigns")
          .insert({
            kultur_organization_id: kulturOrgId,
            advertiser_organization_id: advertiserOrgId,
            name: "RBAC Campaign",
            slug: `rbac-camp-${Date.now()}`,
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            created_by: report.created.users.admin.id,
          })
          .select("id")
          .limit(1);
        report.roleChecks.admin.createCampaign = {
          ok: !createCamp.error,
          error: createCamp.error?.message ?? null,
          id: createCamp.data?.[0]?.id ?? null,
        };
      } catch (err) {
        report.errors.push("admin role check failed: " + String(err));
      }

      // Advertiser checks
      try {
        const advSign = await signInAndClient(
          report.created.users.advertiser.email,
        );
        const advClient = advSign.userClient;
        // advertiser attempting to create campaign for their advertiser org
        const createCampAdv = await advClient
          .from("campaigns")
          .insert({
            kultur_organization_id: kulturOrgId,
            advertiser_organization_id: report.created.advertiserOrgId,
            name: "Adv Campaign",
            slug: `adv-camp-${Date.now()}`,
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 3600 * 1000).toISOString(),
            created_by: report.created.users.advertiser.id,
          })
          .select("id")
          .limit(1);
        report.roleChecks.advertiser = {
          createCampaign: {
            ok: !createCampAdv.error,
            error: createCampAdv.error?.message ?? null,
            id: createCampAdv.data?.[0]?.id ?? null,
          },
        };
      } catch (err) {
        report.errors.push("advertiser role check failed: " + String(err));
      }

      // Venue checks
      try {
        const vSign = await signInAndClient(report.created.users.venue.email);
        const vClient = vSign.userClient;
        // try creating an event for venue org
        const createEvent = await vClient
          .from("events")
          .insert({
            organizer_organization_id: report.created.venueOrgId,
            name: "Venue Created Event",
            slug: `venue-event-${Date.now()}`,
            starts_at: new Date().toISOString(),
            ends_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          })
          .select("id")
          .limit(1);
        report.roleChecks.venue = {
          createEvent: {
            ok: !createEvent.error,
            error: createEvent.error?.message ?? null,
            id: createEvent.data?.[0]?.id ?? null,
          },
        };
      } catch (err) {
        report.errors.push("venue role check failed: " + String(err));
      }

      // Volunteer checks - call RPC to start public scan
      try {
        const volSign = await signInAndClient(
          report.created.users.volunteer.email,
        );
        const volClient = volSign.userClient;
        const rpc = await volClient.rpc("start_public_scan", {
          input_batch_code: report.created.batchCode,
        });
        report.roleChecks.volunteer = {
          startPublicScan: {
            ok: !rpc.error,
            result: rpc.data ?? null,
            error: rpc.error?.message ?? null,
          },
        };
      } catch (err) {
        report.errors.push("volunteer role check failed: " + String(err));
      }
    }

    console.log(
      "E2E run complete — all inserts finished without thrown errors.",
    );
  } catch (err) {
    console.error("E2E run failed:", err.message ?? err);
    report.errors.push(String(err));
  }

  console.log("REPORT:\n", JSON.stringify(report, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(4);
});
