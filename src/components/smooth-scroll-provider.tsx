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
    gsap.defaults({ force3D: true, lazy: false });

    // Detect mobile touch screen environment
    const isMobile =
      window.innerWidth <= 768 ||
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    // Luxury cubic easing function matching laptop scroll
    const luxuryEase = (t: number) =>
      Math.min(1, 1.001 - Math.pow(2, -10 * t));

    // Initialize ultra-calm, bounded Lenis
    // Keeps mouse wheel on laptop smooth, calm, and near (~35px per notch)
    const lenis = new Lenis({
      duration: 0.9,
      easing: luxuryEase,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.35, // Luxury slow wheel on laptop
      syncTouch: false, // Managed by our touch controller to guarantee identical luxury easing
      virtualScroll: (data) => {
        // Suppress Lenis's internal touch handler so it doesn't stop or interfere with our custom smooth touch
        if (data.event && data.event.type && data.event.type.startsWith("touch")) {
          (data.event as unknown as { lenisStopPropagation: boolean }).lenisStopPropagation = true;
          return false;
        }
        // Cap single mouse wheel impulses smoothly on desktop/laptop
        const absDelta = Math.abs(data.deltaY);
        const MAX_WHEEL_IMPULSE = isMobile ? 45 : 70;
        if (absDelta > MAX_WHEEL_IMPULSE) {
          data.deltaY =
            Math.sign(data.deltaY) *
            (MAX_WHEEL_IMPULSE + Math.log1p(absDelta - MAX_WHEEL_IMPULSE) * 6);
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
    // Eliminates mobile runaway fling and brings the exact same calm, near, smooth luxury feel of laptop
    let touchStartY = 0;
    let touchStartX = 0;
    let lastTouchY = 0;
    let lastMoveTime = 0;
    let releaseVelocity = 0;
    let isTouchActive = false;
    let isScrollGesture = false;
    let touchTargetY = 0;

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
      releaseVelocity = 0;
      isTouchActive = true;
      isScrollGesture = false;

      // Anchor to current smooth scroll position
      touchTargetY = lenis.animatedScroll;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchActive || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const now = performance.now();
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      const stepDeltaY = lastTouchY - touch.clientY; // positive = dragged upward -> scroll downward
      const dt = Math.max(8, now - lastMoveTime);
      lastMoveTime = now;
      lastTouchY = touch.clientY;

      // Calculate instantaneous velocity in px/ms
      releaseVelocity = stepDeltaY / dt;

      // Differentiate vertical scroll gesture from taps or horizontal swipes
      if (!isScrollGesture) {
        if (Math.abs(diffY) > 7 && Math.abs(diffY) >= Math.abs(diffX)) {
          isScrollGesture = true;
        } else if (Math.abs(diffX) > 12 && Math.abs(diffX) > Math.abs(diffY)) {
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

        // Controlled distance factor (100px drag = ~52px target scroll)
        const TOUCH_SCALE = 0.52;
        touchTargetY += stepDeltaY * TOUCH_SCALE;

        // Hard cap maximum lead from current position: physically prevents flying too far
        const MAX_LEAD = Math.min(220, window.innerHeight * 0.3);
        touchTargetY = Math.max(
          lenis.animatedScroll - MAX_LEAD,
          Math.min(lenis.animatedScroll + MAX_LEAD, touchTargetY)
        );

        // Clamp within document bounds
        touchTargetY = Math.max(0, Math.min(lenis.limit, touchTargetY));

        // Smooth glide with laptop-identical luxury cubic easing
        lenis.scrollTo(touchTargetY, {
          duration: 0.8,
          easing: luxuryEase,
          lock: false,
        });
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouchActive) return;
      isTouchActive = false;

      if (!isScrollGesture) return;

      // If finger was held stationary before lifting, flick velocity decays
      const timeSinceLastMove = performance.now() - lastMoveTime;
      const decay = Math.max(0, 1 - timeSinceLastMove / 100);
      const effectiveVelocity = releaseVelocity * decay;

      // Gentle, strictly capped momentum bonus (max 85px extra)
      const absVel = Math.abs(effectiveVelocity);
      if (absVel > 0.25) {
        const flickBonus =
          Math.sign(effectiveVelocity) *
          Math.min(85, Math.pow(absVel * 35, 0.72));
        touchTargetY += flickBonus;

        const MAX_LEAD = Math.min(240, window.innerHeight * 0.35);
        touchTargetY = Math.max(
          lenis.animatedScroll - MAX_LEAD,
          Math.min(lenis.animatedScroll + MAX_LEAD, touchTargetY)
        );
        touchTargetY = Math.max(0, Math.min(lenis.limit, touchTargetY));

        lenis.scrollTo(touchTargetY, {
          duration: 0.85,
          easing: luxuryEase,
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

