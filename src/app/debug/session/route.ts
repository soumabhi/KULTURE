import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getAppSession();
    return NextResponse.json({ ok: true, session });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("debug session error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
