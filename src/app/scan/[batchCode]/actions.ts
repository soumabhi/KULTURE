"use server";

import { z } from "zod";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const gameEventSchema = z.object({
  scanSessionId: z.string().uuid(),
  eventType: z.enum(["GAME_STARTED", "GAME_COMPLETED"]),
  score: z.number().int().min(0).max(100000).optional(),
  durationSeconds: z.number().int().min(1).max(3600).optional(),
});

export type GameEventResult = { ok: boolean; error?: string };

export async function recordGameEvent(input: {
  scanSessionId: string;
  eventType: "GAME_STARTED" | "GAME_COMPLETED";
  score?: number;
  durationSeconds?: number;
}): Promise<GameEventResult> {
  const parsed = gameEventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid game event." };
  }

  if (!getSupabasePublicConfig()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const eventData: Record<string, number> = {};
  if (parsed.data.score !== undefined) eventData.score = parsed.data.score;
  if (parsed.data.durationSeconds !== undefined) {
    eventData.duration_seconds = parsed.data.durationSeconds;
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.rpc("record_public_experience_event", {
    input_scan_session_id: parsed.data.scanSessionId,
    input_event_type: parsed.data.eventType,
    input_event_data: eventData,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
