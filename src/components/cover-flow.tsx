"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./cover-flow.module.css";

const BOTTLES = [
  "/kb-3.png", // 1. Nexora (Blue / Yellow / White)
  "/kb-1.png", // 2. Bitego (Red / White / Orange)
  "/kb-4.png", // 3. Building The Future (Green / Yellow)
  "/kb-5.png", // 4. Travora (Red / White)
  "/kb-2.png", // 5. Lalchnd (Maroon / Gold)
] as const;

/** Twenty slots = four full passes of the five bottles for a tight, seamless orbit wheel (18° per bottle) */
const COUNT = 20;
const STEP_SEC = 1.85;
const INTRO_MS = 5350;
const CYCLE_SEC = COUNT * STEP_SEC;
const ANGLE_STEP = 360 / COUNT; // 18 degrees per bottle

/** Compact circular orbit radius: bottle bases touch/align snugly */
const RADIUS_Y = 112; // in % of bottle height
const ASPECT = 268 / 743;
const RADIUS_X = RADIUS_Y / ASPECT; // ~310% of bottle width

const ANGLE_FULL = 60; // fully visible across hero arc
const ANGLE_GONE = 88; // submerged at bottom boundary
const ANGLE_SPAN = ANGLE_GONE - ANGLE_FULL;
const HIDE_ALPHA = 0.01;
const DEG = Math.PI / 180;

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
        applyOrbitLayout(state[i], orbitAngleAt(i, offset));
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
        {Array.from({ length: COUNT }, (_, index) => {
          const src = BOTTLES[index % BOTTLES.length];
          return (
            <div key={`${index}-${src}`} className={styles.bottle}>
              {/* Native img: next/image overhead is costly inside an rAF transform loop */}
              <img
                src={src}
                alt=""
                width={268}
                height={743}
                className={styles.photo}
                draggable={false}
                decoding="async"
                fetchPriority={index < 5 ? "high" : "low"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function orbitAngleAt(index: number, offset: number) {
  let u = (index / COUNT - offset) % 1;
  if (u > 0.5) u -= 1;
  if (u < -0.5) u += 1;
  return u * 360;
}

function applyOrbitLayout(card: CardState, angleDeg: number) {
  const absAngle = Math.abs(angleDeg);
  const opacity = orbitOpacity(absAngle);

  if (opacity < HIDE_ALPHA) {
    if (card.opacity !== 0) {
      card.opacity = 0;
      card.el.style.opacity = "0";
      card.el.style.visibility = "hidden";
    }
    return;
  }

  const theta = angleDeg * DEG;
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const x = sinTheta * RADIUS_X;
  const y = (1 - cosTheta) * RADIUS_Y;
  const z = (1000 + cosTheta * 100) | 0;

  const tx =
    "translate3d(" +
    x.toFixed(1) +
    "%," +
    y.toFixed(1) +
    "%,0) rotate(" +
    angleDeg.toFixed(1) +
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

function orbitOpacity(absAngle: number) {
  return smoother((ANGLE_GONE - absAngle) / ANGLE_SPAN);
}

function smoother(t: number) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * x * (x * (x * 6 - 15) + 10);
}
