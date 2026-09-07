"use client";

import { useState } from "react";
import KeycapButton from "@/components/keycap-button";
import LogoStatic from "@/components/logo-static";
import styles from "@/components/login-modal.module.css";

export default function BootstrapRegisterUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/auth/bootstrap-first/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Unknown error");
      } else {
        setMessage(`Created user ${data.userId}. Organization: ${data.orgId}`);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="stage flex min-h-dvh items-center justify-center px-4 py-10">
      <section
        className={`${styles.modal} w-full max-w-md sm:max-w-lg rounded-2xl border border-black/10 bg-white/90 p-6 sm:p-8 backdrop-blur-md mx-4`}
      >
        <div className="w-full flex justify-center mb-3">
          <div className="w-36 sm:w-44">
            <LogoStatic />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Register first admin</h1>
        <p className="text-sm text-muted mb-4">
          One-time bootstrap — provide the secret token and desired credentials.
        </p>

        {message ? (
          <div className="rounded-md bg-green-50 border border-green-100 p-3 text-sm text-green-800 mb-4">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 sm:p-6 rounded-lg border"
        >
          <label className="block text-sm">
            <div className="mb-1">Bootstrap token</div>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base"
              required
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-base"
              required
              minLength={6}
            />
          </label>

          <div className="flex justify-end">
            <KeycapButton type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create first admin"}
            </KeycapButton>
          </div>
        </form>
      </section>
    </main>
  );
}
