import Link from "next/link";
import KeycapButton from "@/components/keycap-button";
import LogoStatic from "@/components/logo-static";
import styles from "@/components/login-modal.module.css";
import { sendMagicLink, signInWithPassword } from "./actions";
import { sanitizeNextPath } from "@/lib/routing/safe-next-path";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    sent?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = sanitizeNextPath(params.next);
  const sent = params.sent === "1";
  const error = params.error;
  const configured = isSupabaseConfigured();

  return (
    <main className="stage flex min-h-dvh items-center justify-center px-4 py-10">
      <section
        className={`${styles.modal} w-full max-w-md sm:max-w-lg rounded-2xl border border-black/10 bg-white/90 p-6 sm:p-8 backdrop-blur-md mx-4`}
      >
        <div className="flex flex-col items-center -mt-6 mb-4">
          <div className="w-full flex justify-center">
            <div className="w-40 sm:w-48">
              <LogoStatic />
            </div>
          </div>
        </div>

        {!configured ? (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Supabase environment variables are not configured yet. Add
            NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable
            authentication.
          </p>
        ) : null}

        {sent ? (
          <p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
            Magic link sent. Open your email and continue to the platform.
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <form
            action={signInWithPassword}
            className="space-y-4 p-4 sm:p-6 rounded-lg border"
          >
            <input type="hidden" name="next" value={next} />
            <h3 className="text-lg font-medium">Sign in</h3>
            <label className="block text-sm">
              <span className="sr-only">Email</span>
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base"
              />
            </label>
            <label className="block text-sm">
              <span className="sr-only">Password</span>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base"
              />
            </label>
            <div className="flex items-center justify-between">
              <Link
                href="/login?next=/auth/recover"
                className="text-sm text-muted"
              >
                Forgot?
              </Link>
              <div className="ml-4">
                <KeycapButton type="submit">Sign in</KeycapButton>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6">
          <div className="rounded-lg border p-4 sm:p-6">
            <h3 className="text-lg font-medium">Or use magic link</h3>
            <form
              action={sendMagicLink}
              className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <input type="hidden" name="next" value={next} />
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className="w-full sm:flex-1 rounded-lg border border-gray-200 px-4 py-3 text-base"
              />
              <div className="sm:ml-2">
                <KeycapButton type="submit">Send Magic Link</KeycapButton>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
