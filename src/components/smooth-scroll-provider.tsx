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
      lerp: 0.075, // Softer continuous exponential damping (silky, cushioned glide)
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.45, // Responsive yet calm wheel scroll
      syncTouch: false, // Handled with dedicated continuous damping below
      virtualScroll: (data) => {
        // Suppress Lenis's internal touch handler so it doesn't conflict with our smooth touch controller
        if (data.event && data.event.type && data.event.type.startsWith("touch")) {
          (data.event as unknown as { lenisStopPropagation: boolean }).lenisStopPropagation = true;
          return false;
        }
        // Cap single mouse wheel impulses smoothly on desktop/laptop
        const absDelta = Math.abs(data.deltaY);
        const MAX_WHEEL_IMPULSE = 80;
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
    // Continuous exponential damping: silky smooth, responsive, and bounded
    let touchStartY = 0;
    let touchStartX = 0;
    let lastTouchY = 0;
    let lastMoveTime = 0;
    let releaseVelocity = 0;
    let filteredDeltaY = 0;
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
      filteredDeltaY = 0;
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
        if (Math.abs(diffY) > 6 && Math.abs(diffY) >= Math.abs(diffX)) {
          isScrollGesture = true;
          filteredDeltaY = stepDeltaY;
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

        // 2-sample low-pass filter eliminates touch sensor micro-jitter
        filteredDeltaY = filteredDeltaY * 0.25 + stepDeltaY * 0.75;

        // Natural, smooth distance scale (78% travel)
        const TOUCH_SCALE = 0.78;
        touchTargetY += filteredDeltaY * TOUCH_SCALE;

        // Bounded lead from current position: prevents runaway fling while keeping glide fluid
        const MAX_LEAD = Math.min(360, window.innerHeight * 0.45);
        touchTargetY = Math.max(
          lenis.animatedScroll - MAX_LEAD,
          Math.min(lenis.animatedScroll + MAX_LEAD, touchTargetY)
        );

        // Clamp within document bounds
        touchTargetY = Math.max(0, Math.min(lenis.limit, touchTargetY));

        // Soft, continuous exponential damping glide (lerp: 0.07)
        lenis.scrollTo(touchTargetY, {
          lerp: 0.07,
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
      const decay = Math.max(0, 1 - timeSinceLastMove / 120);
      const effectiveVelocity = releaseVelocity * decay;

      // Feather-soft, cushioned flick inertia (capped to max 130px extra)
      const absVel = Math.abs(effectiveVelocity);
      if (absVel > 0.16) {
        const flickBonus =
          Math.sign(effectiveVelocity) *
          Math.min(130, Math.pow(absVel * 36, 0.76));
        touchTargetY += flickBonus;

        const MAX_LEAD = Math.min(380, window.innerHeight * 0.48);
        touchTargetY = Math.max(
          lenis.animatedScroll - MAX_LEAD,
          Math.min(lenis.animatedScroll + MAX_LEAD, touchTargetY)
        );
        touchTargetY = Math.max(0, Math.min(lenis.limit, touchTargetY));

        // Ultra-smooth deceleration coast (lerp: 0.06)
        lenis.scrollTo(touchTargetY, {
          lerp: 0.06,
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

