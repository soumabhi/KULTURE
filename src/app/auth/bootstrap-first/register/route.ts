import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /auth/bootstrap-first/register
 * Body: JSON { token, email, password }
 * - Validates BOOTSTRAP_TOKEN env matches provided token
 * - Requires SUPABASE_SERVICE_ROLE_KEY to be set on server
 * - If any `KULTUR_OWNER` exists, returns 409
 * - Otherwise creates a Supabase user and inserts organization_members granting KULTUR_OWNER
 */
export async function POST(request: Request) {
  try {
    const envToken = process.env.BOOTSTRAP_TOKEN;
    if (!envToken) {
      return NextResponse.json(
        { error: "BOOTSTRAP_TOKEN not configured on server." },
        { status: 500 },
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let body: any = {};
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const form = await request.formData();
      body = Object.fromEntries(form as any);
    }

    const token = String(body.token ?? "");
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!token || token !== envToken) {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            "SUPABASE_SERVICE_ROLE_KEY not configured on server. Use the CLI bootstrap script instead.",
        },
        { status: 500 },
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // If any owner exists, refuse
    const ownersRes = await admin
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("role", "KULTUR_OWNER");
    const ownersCount = (ownersRes as any).count ?? 0;
    if (ownersCount > 0) {
      return NextResponse.json(
        { error: "A KULTUR_OWNER already exists." },
        { status: 409 },
      );
    }

    // Create user via admin API
    const createRes: any = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createRes.error) {
      return NextResponse.json(
        { error: createRes.error.message ?? "Could not create user." },
        { status: 400 },
      );
    }
    const userId = createRes.data?.user?.id ?? createRes.data?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User creation returned no id." },
        { status: 500 },
      );
    }

    // Ensure kultur org exists
    const orgRes = await admin
      .from("organizations")
      .select("id")
      .eq("slug", "kultur")
      .limit(1);
    let orgId: string | undefined = undefined;
    if (orgRes.data && orgRes.data.length > 0) orgId = orgRes.data[0].id;
    if (!orgId) {
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
      orgId = ins.data?.[0]?.id;
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Could not create or find Kultur organization." },
        { status: 500 },
      );
    }

    // Ensure a profile row exists for the new user (profiles.id references auth.users.id)
    // Create sensible default profile fields to avoid missing-data issues in prod
    const displayName = email.split("@")[0] || "Kultur Admin";
    const safeFullName = displayName.length > 0 ? displayName : "Kultur Admin";
    const upsertProfile = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: safeFullName,
        phone: null,
        avatar_url: null,
      },
      { onConflict: "id" },
    );
    if (upsertProfile.error) {
      return NextResponse.json(
        {
          error:
            upsertProfile.error.message ??
            "Could not create profile row for user.",
        },
        { status: 500 },
      );
    }

    // Insert membership
    const { error: insertErr } = await admin
      .from("organization_members")
      .insert({
        organization_id: orgId,
        user_id: userId,
        role: "KULTUR_OWNER",
        status: "ACTIVE",
      });
    if (insertErr) {
      return NextResponse.json(
        { error: insertErr.message ?? "Could not insert organization member." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, userId, orgId });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("bootstrap register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
