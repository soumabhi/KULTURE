import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Secret bootstrap endpoint.
 * GET /auth/bootstrap-first?token=<TOKEN>
 * - Requires env BOOTSTRAP_TOKEN to be set and match the provided token.
 * - If no user is signed in, redirects to /login with next pointing here.
 * - If any KULTUR_OWNER exists, returns 409 and does nothing.
 * - Otherwise, ensures `kultur` org exists and inserts organization_members granting KULTUR_OWNER to the caller.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const envToken = process.env.BOOTSTRAP_TOKEN;

  if (!envToken) {
    return NextResponse.redirect(
      `/auth/bootstrap-first/complete?status=error&message=${encodeURIComponent("BOOTSTRAP_TOKEN not configured on server.")}`,
    );
  }

  if (!token || token !== envToken) {
    return NextResponse.redirect(
      `/auth/bootstrap-first/complete?status=error&message=${encodeURIComponent("Invalid token.")}`,
    );
  }

  const supabase = await getSupabaseServerClient();
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      // Not signed in; redirect to login with next back to this URL
      const redirectUrl = `/login?next=/auth/bootstrap-first?token=${encodeURIComponent(token)}`;
      return NextResponse.redirect(redirectUrl);
    }
    const userId = userData.user.id;

    // Check existing owners
    const ownersRes = await supabase
      .from("organization_members")
      .select("id", { count: "exact", head: true })
      .eq("role", "KULTUR_OWNER");
    const ownersCount = (ownersRes as any).count ?? 0;
    if (ownersCount > 0) {
      return NextResponse.redirect(
        `/auth/bootstrap-first/complete?status=exists&message=${encodeURIComponent("A KULTUR_OWNER already exists.")}`,
      );
    }

    // Ensure kultur org exists
    const orgRes = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", "kultur")
      .limit(1);
    let orgId: string | undefined = undefined;
    if (orgRes.data && orgRes.data.length > 0) orgId = orgRes.data[0].id;
    if (!orgId) {
      const ins = await supabase
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
      return NextResponse.redirect(
        `/auth/bootstrap-first/complete?status=error&message=${encodeURIComponent("Could not establish Kultur organization.")}`,
      );
    }

    // Insert membership (if conflict, ignore)
    const { error: insertErr } = await supabase
      .from("organization_members")
      .insert({
        organization_id: orgId,
        user_id: userId,
        role: "KULTUR_OWNER",
        status: "ACTIVE",
      });
    if (insertErr) {
      return NextResponse.redirect(
        `/auth/bootstrap-first/complete?status=error&message=${encodeURIComponent(`Insert failed: ${insertErr.message}`)}`,
      );
    }

    return NextResponse.redirect(
      `/auth/bootstrap-first/complete?status=ok&message=${encodeURIComponent("You are now KULTUR_OWNER.")}`,
    );
  } catch (e: any) {
    // Do not expose internals
    // eslint-disable-next-line no-console
    console.error("bootstrap-first error:", e);
    return NextResponse.redirect(
      `/auth/bootstrap-first/complete?status=error&message=${encodeURIComponent("Server error")}`,
    );
  }
}
