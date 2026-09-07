"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const BASE_RATE = 1;
const BOOST = 16;
const MAX_RATE = 180;
const DECAY_TAU = 2.2;

function spinAnimation(el: HTMLElement | null) {
  if (!el) return null;
  return el
    .getAnimations()
    .find(
      (anim): anim is CSSAnimation =>
        anim instanceof CSSAnimation && anim.animationName === "chakra-spin",
    );
}

export default function LogoLockup() {
  const lockupRef = useRef<HTMLDivElement>(null);
  const chakraRef = useRef<HTMLImageElement>(null);
  const rateRef = useRef(BASE_RATE);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const [hot, setHot] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const lockup = lockupRef.current;
    if (!lockup) return;

    if (hot) return;

    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "lockup-to-logo") setHot(true);
    };

    lockup.addEventListener("animationend", onEnd);
    return () => lockup.removeEventListener("animationend", onEnd);
  }, [hot]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function applyRate(rate: number) {
    const anim = spinAnimation(chakraRef.current);
    if (anim) anim.playbackRate = rate;
  }

  function decay(now: number) {
    const last = lastRef.current || now;
    const dt = Math.min(0.05, (now - last) / 1000);
    lastRef.current = now;

    const extra = rateRef.current - BASE_RATE;
    if (extra <= 0.02) {
      rateRef.current = BASE_RATE;
      applyRate(BASE_RATE);
      rafRef.current = 0;
      return;
    }

    rateRef.current = BASE_RATE + extra * Math.exp(-dt / DECAY_TAU);
    applyRate(rateRef.current);
    rafRef.current = requestAnimationFrame(decay);
  }

  function spinUp() {
    if (!hot) return;
    rateRef.current = Math.min(MAX_RATE, rateRef.current + BOOST);
    applyRate(rateRef.current);
    if (!rafRef.current) {
      lastRef.current = 0;
      rafRef.current = requestAnimationFrame(decay);
    }
  }

  return (
    <div
      ref={lockupRef}
      className={`lockup lockup-to-logo${hot ? " is-hot" : ""}`}
      role="button"
      tabIndex={hot ? 0 : -1}
      aria-label="Kulture"
      aria-disabled={!hot}
      onClick={spinUp}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          spinUp();
        }
      }}
    >
      <div className="chakra-travel">
        <Image
          ref={chakraRef}
          src="/konarkc.png"
          alt=""
          width={1261}
          height={1247}
          priority
          draggable={false}
          className="chakra-spin mx-auto block h-auto w-[90%] select-none"
        />
      </div>
      <div className="pointer-events-none absolute top-1/2 left-1/2 w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/kultur.png"
          alt=""
          width={2004}
          height={785}
          priority
          draggable={false}
          className="kultur-pop h-auto w-full select-none"
        />
      </div>
    </div>
  );
}
