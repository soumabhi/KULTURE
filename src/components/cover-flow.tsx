"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./cover-flow.module.css";

const BOTTLES = [
  "/kb-1.png",
  "/kb-2.png",
  "/kb-3.png",
  "/kb-4.png",
  "/kb-5.png",
] as const;

/** Ten slots = two full passes of the five labels for a seamless loop. */
const COUNT = 10;
const STEP_SEC = 1.7;
const INTRO_MS = 5350;
const CYCLE_SEC = COUNT * STEP_SEC;

/** ~5 visible at once with clear gaps like the Kultur fan reference. */
const FADE_FULL = 1.35;
const FADE_GONE = 2.7;
const ANGLE_PER = 16;
const ANGLE_MAX = 46;
const RADIUS = 340;
const ASPECT = 268 / 743;
const HIDE_ALPHA = 0.06;
const DEG = Math.PI / 180;
const FADE_SPAN = FADE_GONE - FADE_FULL;

type CardState = {
  el: HTMLDivElement;
  opacity: number;
  z: number;
  tx: string;
};

export default function CoverFlow() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const cards = Array.from(
      scene.querySelectorAll<HTMLDivElement>(`.${styles.bottle}`),
    );
    const state: CardState[] = cards.map((el) => ({
      el,
      opacity: -1,
      z: -1,
      tx: "",
    }));

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const paint = (offset: number) => {
      for (let i = 0; i < COUNT; i++) {
        applyLayout(state[i], slotAt(i, offset));
      }
    };

    paint(0);
    if (reduced) return;

    let frame = 0;
    const motionStart = performance.now() + INTRO_MS;

    const tick = (now: number) => {
      const elapsed = (now - motionStart) / 1000;
      paint(elapsed < 0 ? 0 : (elapsed / CYCLE_SEC) % 1);
      frame = requestAnimationFrame(tick);
    };

    // Don't burn frames during the intro — start the loop when motion begins.
    const startTimer = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, INTRO_MS);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.stage} aria-hidden="true">
      <div ref={sceneRef} className={styles.scene}>
        {Array.from({ length: COUNT }, (_, index) => (
          <div key={index} className={styles.bottle}>
            {/* Native img: next/image overhead is costly inside an rAF transform loop */}
            <img
              src={BOTTLES[index % BOTTLES.length]}
              alt=""
              width={268}
              height={743}
              className={styles.photo}
              draggable={false}
              decoding="async"
              fetchPriority={index < 5 ? "high" : "low"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function slotAt(index: number, offset: number) {
  let u = index / COUNT - offset;
  u -= Math.floor(u + 0.5);
  return u * COUNT;
}

function applyLayout(card: CardState, slot: number) {
  const abs = Math.abs(slot);
  const opacity = edgeOpacity(abs);

  if (opacity < HIDE_ALPHA) {
    if (card.opacity !== 0) {
      card.opacity = 0;
      card.el.style.opacity = "0";
      card.el.style.visibility = "hidden";
    }
    return;
  }

  const angle = Math.max(-ANGLE_MAX, Math.min(ANGLE_MAX, slot * ANGLE_PER));
  const theta = angle * DEG;
  const x = Math.sin(theta) * RADIUS;
  const y = (1 - Math.cos(theta)) * RADIUS * ASPECT;
  const z = (1000 - abs * 100) | 0;
  const tx =
    "translate3d(" +
    x.toFixed(1) +
    "%," +
    y.toFixed(1) +
    "%,0) rotate(" +
    angle.toFixed(1) +
    "deg)";

  if (card.opacity === 0) {
    card.el.style.visibility = "visible";
  }
  if (card.tx !== tx) {
    card.tx = tx;
    card.el.style.transform = tx;
  }
  if (card.z !== z) {
    card.z = z;
    card.el.style.zIndex = String(z);
  }
  if (card.opacity !== opacity) {
    card.opacity = opacity;
    card.el.style.opacity = opacity < 0.995 ? opacity.toFixed(2) : "1";
  }
}

function edgeOpacity(abs: number) {
  return smoother((FADE_GONE - abs) / FADE_SPAN);
}

function smoother(t: number) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * x * (x * (x * 6 - 15) + 10);
}
