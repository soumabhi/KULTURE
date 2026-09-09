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

/** Compact circular orbit radius: perfectly symmetric within viewport boundaries */
const RADIUS_Y = 105; // in % of bottle height
const ASPECT = 268 / 743;
const RADIUS_X = RADIUS_Y / ASPECT; // ~291% of bottle width

const ANGLE_FULL = 54; // fully visible across hero arc
const ANGLE_GONE = 82; // submerged at bottom boundary
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
    let isPaused = false;
    let isVisible = true;
    let isScrolledPast = false;
    const motionStart = performance.now() + INTRO_MS;

    const tick = (now: number) => {
      if (!isPaused && isVisible && !isScrolledPast) {
        const elapsed = (now - motionStart) / 1000;
        paint(elapsed < 0 ? 0 : (elapsed / CYCLE_SEC) % 1);
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const startLoop = () => {
      if (!frame && !isPaused && isVisible && !isScrolledPast) {
        frame = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (isPaused) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Watch scroll position: cancel rAF loop and hide bottles immediately when user scrolls past hero
    const handleScroll = () => {
      const past = window.scrollY > window.innerHeight * 0.92;
      if (past !== isScrolledPast) {
        isScrolledPast = past;
        if (past) {
          stopLoop();
          scene.style.visibility = "hidden";
        } else {
          scene.style.visibility = "visible";
          startLoop();
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    // Pause loop if CoverFlow is completely unrendered
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisible = entry.isIntersecting;
        if (!isVisible) {
          stopLoop();
          scene.style.visibility = "hidden";
        } else if (!isScrolledPast) {
          scene.style.visibility = "visible";
          startLoop();
        }
      },
      { threshold: 0.02 }
    );
    observer.observe(scene);

    // Don't burn frames during the intro — start the loop when motion begins.
    const startTimer = window.setTimeout(() => {
      startLoop();
    }, INTRO_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      observer.disconnect();
      window.clearTimeout(startTimer);
      stopLoop();
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
                loading="eager"
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

  // Fast-exit for off-screen bottles: skip all trigonometric & polynomial math (70% CPU savings)
  if (absAngle >= ANGLE_GONE) {
    if (card.opacity !== 0) {
      card.opacity = 0;
      card.el.style.opacity = "0";
      card.el.style.visibility = "hidden";
    }
    return;
  }

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
  if (absAngle <= ANGLE_FULL) return 1;
  const t = (ANGLE_GONE - absAngle) / ANGLE_SPAN;
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}
