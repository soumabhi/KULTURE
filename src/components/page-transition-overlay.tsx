"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./page-transition-overlay.module.css";

type PageTransitionProps = {
  isTriggered: boolean;
  onComplete?: () => void;
};

const INITIAL_PATH = "M 0 1 V 1 Q 0.5 1 1 1 V 1 z";
const START_PATH = "M 0 1 V 0.5 Q 0.5 0 1 0.5 V 1 z";
const END_PATH = "M 0 1 V 0 Q 0.5 0 1 0 V 1 z";

export default function PageTransitionOverlay({
  isTriggered,
  onComplete,
}: PageTransitionProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isTriggered || !pathRef.current) return;

    setIsActive(true);

    // Reset path to bottom initial state
    gsap.set(pathRef.current, {
      attr: { d: INITIAL_PATH },
    });

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    tl.to(pathRef.current, {
      attr: { d: START_PATH },
      duration: 0.48,
      ease: "power2.in",
    }).to(pathRef.current, {
      attr: { d: END_PATH },
      duration: 0.48,
      ease: "power2.out",
    });

    return () => {
      tl.kill();
    };
  }, [isTriggered, onComplete]);

  return (
    <div
      className={`${styles.wrapper} ${isActive ? styles.active : ""}`}
      aria-hidden={!isActive}
    >
      {/* Normalized clipPath definition for 1:1 viewport matching */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <clipPath id="kulture-transition-clip" clipPathUnits="objectBoundingBox">
            <path ref={pathRef} d={INITIAL_PATH} />
          </clipPath>
        </defs>
      </svg>

      {/* The transition curtain carrying the exact identical CSS radial-gradient */}
      <div className={styles.curtain} />
    </div>
  );
}
