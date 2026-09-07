import { NextResponse } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (getSupabasePublicConfig()) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/", origin));
}
