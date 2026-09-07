"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import KeycapButton from "@/components/keycap-button";
import { KeycapLink } from "@/components/keycap-button";
import { recordGameEvent } from "@/app/scan/[batchCode]/actions";
import styles from "./catch-modak.module.css";

const WIDTH = 360;
const HEIGHT = 560;
const GAME_MS = 30_000;
const SPAWN_MS = 620;
const BASKET_WIDTH = 104;
const BASKET_Y = HEIGHT - 46;
const MAX_FALL_SPEED = 400;

type Modak = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  spin: number;
};

type CatchModakProps = {
  batchCode: string;
  scanSessionId: string;
  rewardThreshold: number;
};

export default function CatchModak({
  batchCode,
  scanSessionId,
  rewardThreshold,
}: CatchModakProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const basketXRef = useRef(WIDTH / 2);
  const scoreRef = useRef(0);
  const [phase, setPhase] = useState<
    "idle" | "running" | "finished" | "reduced"
  >(() => {
    if (typeof window === "undefined") return "idle";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduced"
      : "idle";
  });
  const [score, setScore] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const claimHref = `/scan/${encodeURIComponent(batchCode)}/claim`;

  useEffect(() => {
    if (phase !== "running") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const modaks: Modak[] = [];
    const startedAt = performance.now();
    let lastFrame = startedAt;
    let spawnElapsed = 0;
    let frame = 0;

    scoreRef.current = 0;
    void recordGameEvent({ scanSessionId, eventType: "GAME_STARTED" });

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const logical = ((event.clientX - rect.left) / rect.width) * WIDTH;
      basketXRef.current = clamp(
        logical,
        BASKET_WIDTH / 2,
        WIDTH - BASKET_WIDTH / 2,
      );
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const delta = event.key === "ArrowLeft" ? -30 : 30;
        basketXRef.current = clamp(
          basketXRef.current + delta,
          BASKET_WIDTH / 2,
          WIDTH - BASKET_WIDTH / 2,
        );
      }
    };

    canvas.addEventListener("pointerdown", onPointer);
    canvas.addEventListener("pointermove", onPointer);
    window.addEventListener("keydown", onKey);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const elapsed = now - startedAt;

      spawnElapsed += dt * 1000;
      if (spawnElapsed >= SPAWN_MS) {
        spawnElapsed = 0;
        const radius = 13 + Math.random() * 6;
        modaks.push({
          x: radius + Math.random() * (WIDTH - radius * 2),
          y: -radius,
          radius,
          speed: Math.min(
            MAX_FALL_SPEED,
            150 + elapsed * 0.005 + Math.random() * 60,
          ),
          spin: Math.random() * Math.PI * 2,
        });
      }

      const basketX = basketXRef.current;
      for (let i = modaks.length - 1; i >= 0; i -= 1) {
        const modak = modaks[i];
        modak.y += modak.speed * dt;
        modak.spin += dt * 1.6;

        const caught =
          modak.y + modak.radius >= BASKET_Y &&
          modak.y - modak.radius <= BASKET_Y + 16 &&
          Math.abs(modak.x - basketX) <= BASKET_WIDTH / 2 + modak.radius * 0.4;

        if (caught) {
          modaks.splice(i, 1);
          scoreRef.current += 1;
        } else if (modak.y - modak.radius > HEIGHT) {
          modaks.splice(i, 1);
        }
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawHud(
        ctx,
        scoreRef.current,
        Math.max(0, Math.ceil((GAME_MS - elapsed) / 1000)),
      );
      modaks.forEach((modak) => drawModak(ctx, modak));
      drawBasket(ctx, basketX);

      if (elapsed >= GAME_MS) {
        setScore(scoreRef.current);
        setPhase("finished");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", onPointer);
      canvas.removeEventListener("pointermove", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, scanSessionId]);

  async function claimReward() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    const result = await recordGameEvent({
      scanSessionId,
      eventType: "GAME_COMPLETED",
      score: scoreRef.current,
      durationSeconds: Math.round(GAME_MS / 1000),
    });

    if (!result.ok) {
      setSubmitError(result.error ?? "Could not record the game result.");
      setSubmitting(false);
      return;
    }

    router.push(claimHref);
  }

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Catch the Modak</p>
        <h1 className={styles.title}>
          Catch {rewardThreshold} modaks to unlock the offer
        </h1>
      </header>

      <div className={styles.canvasWrap}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
          aria-label="Catch the Modak game. Move the plate to catch falling modaks."
          role="application"
        />

        {phase === "idle" ? (
          <div className={styles.overlay}>
            <p className={styles.overlayText}>
              Move the plate with your finger, mouse, or arrow keys. You have 30
              seconds.
            </p>
            <KeycapButton type="button" onClick={() => setPhase("running")}>
              Start game
            </KeycapButton>
          </div>
        ) : null}

        {phase === "finished" ? (
          <div className={styles.overlay}>
            <p className={styles.scoreLine}>
              You caught <strong>{score}</strong> modaks
            </p>
            {score >= rewardThreshold ? (
              <>
                {submitError ? (
                  <p className={styles.error}>{submitError}</p>
                ) : null}
                <KeycapButton
                  type="button"
                  onClick={claimReward}
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Claim your reward"}
                </KeycapButton>
              </>
            ) : (
              <>
                <p className={styles.overlayText}>
                  Catch at least {rewardThreshold} modaks to unlock the sponsor
                  offer.
                </p>
                <KeycapButton type="button" onClick={() => setPhase("running")}>
                  Play again
                </KeycapButton>
              </>
            )}
          </div>
        ) : null}

        {phase === "reduced" ? (
          <div className={styles.overlay}>
            <p className={styles.overlayText}>
              Reduced motion is on, so the game is skipped. You can continue
              straight to the offer.
            </p>
            <KeycapLink href={claimHref}>Continue to claim</KeycapLink>
          </div>
        ) : null}
      </div>

      <p className={styles.hint}>
        Plate follows your pointer · Arrow keys work too
      </p>
    </section>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  score: number,
  secondsLeft: number,
) {
  ctx.font = "700 17px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "#241f1b";
  ctx.textAlign = "left";
  ctx.fillText(`Modaks ${score}`, 16, 30);
  ctx.textAlign = "right";
  ctx.fillText(`${secondsLeft}s`, WIDTH - 16, 30);
}

function drawModak(ctx: CanvasRenderingContext2D, modak: Modak) {
  const { x, y, radius, spin } = modak;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(spin) * 0.3);

  const gradient = ctx.createRadialGradient(
    -radius * 0.3,
    -radius * 0.3,
    2,
    0,
    0,
    radius * 1.2,
  );
  gradient.addColorStop(0, "#f2c069");
  gradient.addColorStop(1, "#b4741f");

  ctx.fillStyle = gradient;
  ctx.strokeStyle = "rgba(90, 56, 14, 0.55)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, -radius * 1.35);
  ctx.quadraticCurveTo(
    radius * 1.05,
    -radius * 0.4,
    radius * 0.85,
    radius * 0.35,
  );
  ctx.quadraticCurveTo(radius * 0.7, radius * 1.05, 0, radius * 1.1);
  ctx.quadraticCurveTo(
    -radius * 0.7,
    radius * 1.05,
    -radius * 0.85,
    radius * 0.35,
  );
  ctx.quadraticCurveTo(-radius * 1.05, -radius * 0.4, 0, -radius * 1.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawBasket(ctx: CanvasRenderingContext2D, basketX: number) {
  const left = basketX - BASKET_WIDTH / 2;

  const body = ctx.createLinearGradient(0, BASKET_Y, 0, BASKET_Y + 30);
  body.addColorStop(0, "#3a332c");
  body.addColorStop(1, "#1f1c18");

  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(left, BASKET_Y, BASKET_WIDTH, 26, 12);
  ctx.fill();

  ctx.fillStyle = "#e3b34f";
  ctx.beginPath();
  ctx.roundRect(left, BASKET_Y, BASKET_WIDTH, 6, 3);
  ctx.fill();
}
