import { headers } from "next/headers";

export async function getRequestBaseUrl(): Promise<string> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (!host) {
    throw new Error("Could not resolve request host from headers.");
  }

  return `${protocol}://${host}`;
}
