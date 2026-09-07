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

  console.log("Checking Supabase schema/state...");

  // Check organisation
  const { data: orgs, error: orgErr } = await admin
    .from("organizations")
    .select("id,name,slug,organization_type")
    .eq("slug", "kultur")
    .limit(1);
  if (orgErr) {
    console.error("Error querying organizations:", orgErr.message ?? orgErr);
    process.exit(3);
  }
  if (!orgs || orgs.length === 0) {
    console.error("Kultur organization not found.");
  } else {
    console.log("Found org:", orgs[0]);
  }

  // Find owners
  const { data: owners, error: ownersErr } = await admin
    .from("organization_members")
    .select("id, organization_id, user_id, role, status")
    .eq("role", "KULTUR_OWNER");
  if (ownersErr) {
    console.error(
      "Error querying organization_members:",
      ownersErr.message ?? ownersErr,
    );
    process.exit(3);
  }
  console.log(`Found ${owners?.length ?? 0} KULTUR_OWNER membership(s).`);
  if (owners && owners.length > 0) {
    for (const o of owners) {
      const { data: profile } = await admin
        .from("profiles")
        .select("id,email,full_name,phone,status")
        .eq("id", o.user_id)
        .limit(1);
      console.log("Member:", o, "Profile:", profile?.[0] ?? null);
    }
  }

  // Check dev server root
  const rootUrl = process.env.DEV_SERVER_URL || "http://localhost:3000";
  try {
    const res = await fetch(rootUrl, { method: "GET" });
    console.log(
      `Dev server responded ${res.status} ${res.statusText} at ${rootUrl}`,
    );
  } catch (err) {
    console.error("Dev server not reachable at", rootUrl, err.message ?? err);
  }

  console.log(
    "Checklist complete. If owners are missing, run scripts/bootstrap-first-register.mjs to add one.",
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(4);
});
