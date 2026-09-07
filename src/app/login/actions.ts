"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getRequestBaseUrl } from "@/lib/http/base-url";
import { sanitizeNextPath } from "@/lib/routing/safe-next-path";

export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/app"));

  if (!email) {
    redirect(
      `/login?error=${encodeURIComponent("Email is required")}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    redirect("/login?error=Supabase is not configured");
  }

  const supabase = await getSupabaseServerClient();
  const baseUrl = await getRequestBaseUrl();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(nextPath)}`);
}

export async function signInWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/app"));

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent("Email and password are required")}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    redirect("/login?error=Supabase is not configured");
  }

  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Sign-in failed")}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  redirect(nextPath);
}

export async function signUpWithPassword(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const nextPath = sanitizeNextPath(String(formData.get("next") ?? "/app"));

  if (!email || !password) {
    redirect(
      `/login?error=${encodeURIComponent("Email and password are required")}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  if (password.length < 6) {
    redirect(
      `/login?error=${encodeURIComponent("Password must be at least 6 characters")}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  const config = getSupabasePublicConfig();
  if (!config) {
    redirect("/login?error=Supabase is not configured");
  }

  const supabase = await getSupabaseServerClient();
  const baseUrl = await getRequestBaseUrl();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(nextPath)}`,
    );
  }

  // Ask user to check their email for confirmation.
  redirect(`/login?sent=1&next=${encodeURIComponent(nextPath)}`);
}
