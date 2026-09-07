import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeNextPath } from "@/lib/routing/safe-next-path";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = sanitizeNextPath(searchParams.get("next"));

  if (!getSupabasePublicConfig()) {
    return NextResponse.redirect(
      new URL("/login?error=Supabase is not configured", origin),
    );
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
    // After successful exchange, attempt to bootstrap the first user as KULTUR_OWNER
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (userId) {
        // Check if any KULTUR_OWNER already exists
        const ownersRes = await supabase
          .from("organization_members")
          .select("id", { count: "exact", head: true })
          .eq("role", "KULTUR_OWNER");
        const ownersCount = (ownersRes as any).count ?? 0;
        if (ownersCount === 0) {
          // Ensure 'kultur' organization exists (create if missing)
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
          if (orgId) {
            await supabase
              .from("organization_members")
              .insert({
                organization_id: orgId,
                user_id: userId,
                role: "KULTUR_OWNER",
                status: "ACTIVE",
              });
          }
        }
      }
    } catch (e) {
      // Do not block login on bootstrap errors — just log silently server-side.
      // In production you may want to record this to a log system.
      // eslint-disable-next-line no-console
      console.error("bootstrap first-owner failed:", e);
    }
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
