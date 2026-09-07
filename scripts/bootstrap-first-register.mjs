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

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--email") out.email = args[++i];
    else if (a === "--password") out.password = args[++i];
    else if (a === "--user-id") out.userId = args[++i];
    else if (a === "--org-slug") out.orgSlug = args[++i];
    else if (a === "--org-name") out.orgName = args[++i];
    else if (a === "--help") out.help = true;
  }
  return out;
}

async function main() {
  loadDotEnv();
  const {
    email,
    password,
    userId,
    orgSlug = "kultur",
    orgName = "Kultur",
    help,
  } = parseArgs();
  if (help) {
    console.log(
      "Usage: node scripts/bootstrap-first-register.mjs --email <email> --password <password> [--org-slug kultur]",
    );
    console.log(
      "Or: node scripts/bootstrap-first-register.mjs --user-id <USER_ID> [--org-slug kultur]",
    );
    process.exit(0);
  }

  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error(
      "ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (or present in .env.local).",
    );
    process.exit(2);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    let finalUserId = userId;
    if (!finalUserId) {
      if (!email || !password) {
        console.error(
          "ERROR: either --user-id or both --email and --password must be provided.",
        );
        process.exit(2);
      }
      const res = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (res.error) throw res.error;
      finalUserId = res.data?.user?.id ?? res.data?.id;
      console.log("Created user:", finalUserId);
    }

    // Upsert profile with sensible defaults (match schema: full_name required)
    const displayName = (email ?? "").split("@")[0] || "Kultur Admin";
    const safeFullName = displayName.length > 0 ? displayName : "Kultur Admin";
    const { error: profileErr } = await admin
      .from("profiles")
      .upsert(
        {
          id: finalUserId,
          email: email ?? null,
          full_name: safeFullName,
          phone: null,
          avatar_url: null,
        },
        { onConflict: "id" },
      );
    if (profileErr) throw profileErr;

    // Ensure organization exists
    const { data: orgs } = await admin
      .from("organizations")
      .select("id,slug")
      .eq("slug", orgSlug)
      .limit(1);
    let orgId;
    if (orgs && orgs.length > 0) orgId = orgs[0].id;
    if (!orgId) {
      const ins = await admin
        .from("organizations")
        .insert({
          name: orgName,
          slug: orgSlug,
          organization_type: "KULTUR",
          status: "ACTIVE",
        })
        .select("id")
        .limit(1);
      orgId = ins.data?.[0]?.id;
    }
    if (!orgId)
      throw new Error("Could not determine or create organization id");

    // Insert membership
    const { data: existing } = await admin
      .from("organization_members")
      .select("id,role")
      .eq("organization_id", orgId)
      .eq("user_id", finalUserId)
      .limit(1);
    if (existing && existing.length > 0) {
      console.log("Membership exists, updating to KULTUR_OWNER");
      await admin
        .from("organization_members")
        .update({ role: "KULTUR_OWNER", status: "ACTIVE" })
        .eq("id", existing[0].id);
      console.log("Updated membership", existing[0].id);
    } else {
      const ins = await admin
        .from("organization_members")
        .insert({
          organization_id: orgId,
          user_id: finalUserId,
          role: "KULTUR_OWNER",
          status: "ACTIVE",
        })
        .select("id");
      console.log("Inserted membership", ins.data?.[0]?.id ?? "(unknown)");
    }

    console.log("Bootstrap complete. User:", finalUserId, "Org:", orgId);
  } catch (err) {
    console.error("FAILED:", err.message ?? err);
    process.exit(3);
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("bootstrap-first-register.mjs")
) {
  main();
}
