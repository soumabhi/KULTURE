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

    // Initialize butter-smooth, completely jitter-free Lenis
    // wheelMultiplier: 0.5 cuts velocity in half so scrolling is calm, controlled, and near
    // syncTouch: false lets touch devices run native 120Hz compositor tracking without jitter
    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.5, // 50% speed: calm, controlled, comfortable travel per tick
      touchMultiplier: 1.0,
      syncTouch: false, // Prevents mobile touch jitter; native hardware touch runs at 120fps
      virtualScroll: (data) => {
        // Continuous soft damping for extreme flicks (never abruptly cuts to 0)
        const MAX_DELTA = 160;
        const absDelta = Math.abs(data.deltaY);
        if (absDelta > MAX_DELTA) {
          data.deltaY =
            Math.sign(data.deltaY) *
            (MAX_DELTA + Math.log1p(absDelta - MAX_DELTA) * 14);
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

