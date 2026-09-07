import { redirect } from "next/navigation";
import { getAppSession } from "./session";
import type { AuthenticatedAppSession } from "./types";
import { sanitizeNextPath } from "@/lib/routing/safe-next-path";

export type UnconfiguredResult = {
  state: "unconfigured";
  reason: string;
};

export async function requireSession(
  nextPath: string,
): Promise<AuthenticatedAppSession | UnconfiguredResult> {
  const session = await getAppSession();

  if (session.state === "unconfigured") {
    return session;
  }

  if (session.state === "unauthenticated") {
    const safePath = sanitizeNextPath(nextPath);
    redirect(`/login?next=${encodeURIComponent(safePath)}`);
  }

  return session;
}
