"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
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

    // Anchor navigation handler (#why-kulture, #what-we-do, etc.)
    let lenisInstance: Lenis | null = null;

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
          if (lenisInstance) {
            lenisInstance.scrollTo(targetEl, { offset: -24, duration: 0.9 });
          } else {
            const top = targetEl.getBoundingClientRect().top + window.scrollY - 24;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    // Initialize Lenis with snappy, controlled parameters (prevents runaway fast fling while avoiding sluggishness)
    const lenis = new Lenis({
      lerp: 0.1, // Clean, responsive deceleration on desktop
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: true, // Intercepts mobile touch so it doesn't fly 5,000px down and lag the UI
      syncTouchLerp: 0.14, // Crisper, faster settling: stops promptly without sluggish glide
      touchInertiaExponent: 1.25, // Tightly caps flick momentum: prevents shooting to the end of the page
      touchMultiplier: 1.0, // 1:1 direct finger tracking while touching: zero resistance
    });
    lenisInstance = lenis;

    // Synchronize Lenis scroll position with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

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

