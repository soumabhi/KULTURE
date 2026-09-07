#!/usr/bin/env node
/*
Bootstrap a master admin (KULTUR_OWNER) for the KULTUR platform.

Requirements:
 - Node.js
 - Environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 - You must provide a user id (Supabase `auth.users.id`) via --user-id

Usage:
  node scripts/bootstrap-master-admin.mjs --user-id <USER_ID> [--org-slug kultur] [--org-name "Kultur"]

Notes:
 - This script uses the Supabase service role key and must be run from a secure environment.
 - If the organization with the provided slug does not exist, it will be created.
 - The script will insert or update an `organization_members` row giving the user `KULTUR_OWNER`.
*/

import { createClient } from "@supabase/supabase-js";

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--user-id") out.userId = args[++i];
    else if (a === "--org-slug") out.orgSlug = args[++i];
    else if (a === "--org-name") out.orgName = args[++i];
    else if (a === "--help") {
      out.help = true;
    }
  }
  return out;
}

async function main() {
  const { userId, orgSlug = "kultur", orgName = "Kultur", help } = parseArgs();
  if (help) {
    console.log(
      "Usage: node scripts/bootstrap-master-admin.mjs --user-id <USER_ID> [--org-slug slug] [--org-name name]",
    );
    process.exit(0);
  }

  if (!userId) {
    console.error(
      "ERROR: --user-id is required. Get your user id from /app (Current Signed-in Identity) or Supabase Auth users.",
    );
    process.exit(2);
  }

  const SUPABASE_URL =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.",
    );
    process.exit(2);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    // Ensure organization exists
    const { data: orgs, error: selectErr } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("slug", orgSlug)
      .limit(1);
    if (selectErr) throw selectErr;

    let orgId;
    if (orgs && orgs.length > 0) {
      orgId = orgs[0].id;
      console.log(`Found organization '${orgs[0].name}' (${orgId})`);
    } else {
      const { data: ins, error: insErr } = await supabase
        .from("organizations")
        .insert({
          name: orgName,
          slug: orgSlug,
          organization_type: "KULTUR",
          status: "ACTIVE",
        })
        .select("id")
        .limit(1);
      if (insErr) throw insErr;
      orgId = ins?.[0]?.id;
      console.log(`Created organization '${orgName}' (${orgId})`);
    }

    if (!orgId) throw new Error("Could not determine organization id.");

    // Upsert membership: if exists, update role to KULTUR_OWNER; otherwise insert
    const { data: existing } = await supabase
      .from("organization_members")
      .select("id, role, status")
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .limit(1);

    if (existing && existing.length > 0) {
      const row = existing[0];
      if (row.role === "KULTUR_OWNER") {
        console.log(
          `User ${userId} is already KULTUR_OWNER for org ${orgId}. Nothing to do.`,
        );
        process.exit(0);
      }
      const { error: updErr } = await supabase
        .from("organization_members")
        .update({ role: "KULTUR_OWNER", status: "ACTIVE" })
        .eq("id", row.id);
      if (updErr) throw updErr;
      console.log(`Updated membership ${row.id} -> role KULTUR_OWNER`);
      process.exit(0);
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("organization_members")
      .insert({
        organization_id: orgId,
        user_id: userId,
        role: "KULTUR_OWNER",
        status: "ACTIVE",
      })
      .select("id");
    if (insertErr) throw insertErr;
    console.log(
      `Inserted membership ${inserted?.[0]?.id} granting KULTUR_OWNER to user ${userId}`,
    );
  } catch (err) {
    console.error("FAILED:", err.message ?? err);
    process.exit(3);
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("bootstrap-master-admin.mjs")
) {
  main();
}
