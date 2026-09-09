"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Honor user accessibility preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ lazy: false });

    // Detect mobile touch screen environment
    const isMobile =
      window.innerWidth <= 768 ||
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    // Initialize ultra-smooth, continuous Lenis
    // Uses continuous exponential lerp damping for buttery smooth glide on both wheel and touch
    const lenis = new Lenis({
      lerp: 0.06, // Soft, continuous exponential damping (ultra-smooth, floating glide)
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.5, // Natural, flowing wheel scroll
      syncTouch: false, // Handled with dedicated continuous damping below
      virtualScroll: (data) => {
        // Suppress Lenis's internal touch handler so it doesn't conflict with our smooth touch controller
        if (data.event && data.event.type && data.event.type.startsWith("touch")) {
          (data.event as unknown as { lenisStopPropagation: boolean }).lenisStopPropagation = true;
          return false;
        }
        // Cap single mouse wheel impulses smoothly on desktop/laptop
        const absDelta = Math.abs(data.deltaY);
        const MAX_WHEEL_IMPULSE = 85;
        if (absDelta > MAX_WHEEL_IMPULSE) {
          data.deltaY =
            Math.sign(data.deltaY) *
            (MAX_WHEEL_IMPULSE + Math.log1p(absDelta - MAX_WHEEL_IMPULSE) * 7);
        }
        return true;
      },
    });

    // Synchronize Lenis scroll position with GSAP ScrollTrigger on every frame
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // ── MOBILE TOUCH CONTROLLER ──
    // Zero-lag direct finger anchoring + liquid-smooth momentum coast
    let touchStartY = 0;
    let touchStartX = 0;
    let lastTouchY = 0;
    let lastMoveTime = 0;
    let initialScrollY = 0;
    let isTouchActive = false;
    let isScrollGesture = false;
    let velocityQueue: { dy: number; dt: number }[] = [];

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement | null;
      if (target?.closest("[data-lenis-prevent], [data-lenis-prevent-touch]")) {
        return;
      }

      const touch = e.touches[0];
      const now = performance.now();
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      lastTouchY = touch.clientY;
      lastMoveTime = now;
      velocityQueue = [];
      isTouchActive = true;
      isScrollGesture = false;

      // Anchor to current instantaneous scroll position (instantly catches coasting)
      initialScrollY = lenis.animatedScroll;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchActive || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const now = performance.now();
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      const stepDeltaY = lastTouchY - touch.clientY; // positive = dragged upward -> scroll downward
      const dt = Math.max(6, now - lastMoveTime);
      lastMoveTime = now;
      lastTouchY = touch.clientY;

      // Rolling window of last 3 samples for noise-free velocity
      velocityQueue.push({ dy: stepDeltaY, dt });
      if (velocityQueue.length > 3) velocityQueue.shift();

      // Differentiate vertical scroll gesture from taps or horizontal swipes
      if (!isScrollGesture) {
        if (Math.abs(diffY) > 5 && Math.abs(diffY) >= Math.abs(diffX)) {
          isScrollGesture = true;
        } else if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
          // Horizontal swipe (let sliders or browser handle)
          isTouchActive = false;
          return;
        }
      }

      if (isScrollGesture) {
        // Stop mobile browser (iOS / Android) native runaway momentum
        if (e.cancelable) {
          e.preventDefault();
        }

        // Direct anchor tracking: content stays glued to finger without rubber-band drift
        const totalFingerDelta = touchStartY - touch.clientY;
        const targetY = Math.max(
          0,
          Math.min(lenis.limit, initialScrollY + totalFingerDelta)
        );

        // Smooth, cushioned finger following with zero lag
        lenis.scrollTo(targetY, {
          lerp: 0.14,
          lock: false,
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchActive) return;
      isTouchActive = false;

      if (!isScrollGesture) return;

      // Calculate weighted rolling average release velocity
      let totalDy = 0;
      let totalDt = 0;
      for (const sample of velocityQueue) {
        totalDy += sample.dy;
        totalDt += sample.dt;
      }
      const rawVelocity = totalDt > 0 ? totalDy / totalDt : 0; // px/ms

      // Decay velocity if finger was held stationary before lifting
      const timeSinceLastMove = performance.now() - lastMoveTime;
      const decay = Math.max(0, 1 - timeSinceLastMove / 120);
      const effectiveVelocity = rawVelocity * decay;

      // Liquid momentum coast: scales naturally with flick speed (up to 600px)
      const absVel = Math.abs(effectiveVelocity);
      if (absVel > 0.12) {
        const flickBonus =
          Math.sign(effectiveVelocity) *
          Math.min(620, Math.pow(absVel * 130, 0.88));

        const coastTarget = Math.max(
          0,
          Math.min(lenis.limit, lenis.animatedScroll + flickBonus)
        );

        // Ultra-luxurious, feather-soft deceleration coast (lerp: 0.042)
        lenis.scrollTo(coastTarget, {
          lerp: 0.042,
          lock: false,
        });
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Smooth anchor navigation (#why-kulture, #what-we-do, #where-we-do, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLAnchorElement>(
        "a[href*='#']"
      );
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      const hash = href.startsWith("#")
        ? href
        : href.includes("#")
        ? `#${href.split("#")[1]}`
        : null;

      if (hash && hash !== "#") {
        const targetEl = document.querySelector<HTMLElement>(hash);
        if (targetEl && targetEl instanceof HTMLElement) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -24, duration: 0.9 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

