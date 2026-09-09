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

    // Initialize ultra-smooth, jitter-free Lenis
    // Uses Lenis's native syncTouch engine for 120fps hardware-fluid touch and wheel
    const lenis = new Lenis({
      lerp: 0.015, // Infinite cloud-soft cinematic damping for wheel scrolling
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.7, // Effortless, floating wheel scroll
      syncTouch: true, // Native Lenis touch engine: 1:1 direct finger tracking with zero jitter
      syncTouchLerp: 0.015, // Ultra-deep, liquid-velvet momentum coast on flick release
      touchInertiaExponent: 1.8, // Sustained, gliding flick momentum
      touchMultiplier: 1.15, // Completely effortless, responsive finger tracking
      virtualScroll: (data) => {
        // Softly cap rapid wheel spinning on desktop/laptop
        if (data.event && data.event.type && data.event.type.includes("wheel")) {
          const absDelta = Math.abs(data.deltaY);
          const MAX_WHEEL_IMPULSE = 85;
          if (absDelta > MAX_WHEEL_IMPULSE) {
            data.deltaY =
              Math.sign(data.deltaY) *
              (MAX_WHEEL_IMPULSE + Math.log1p(absDelta - MAX_WHEEL_IMPULSE) * 7);
          }
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
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

