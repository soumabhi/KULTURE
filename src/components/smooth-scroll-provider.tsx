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
    // Piped through Lenis's smooth engine so touch drag is actively cushioned and smoothed
    const lenis = new Lenis({
      lerp: 0.065, // Continuous exponential damping (buttery cushioned glide for both wheel and touch)
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.55, // Effortless, floating wheel scroll
      syncTouch: false, // Proxied into the smooth engine so touch drag is ALSO smoothed
      touchMultiplier: 1.0,
      virtualScroll: (data) => {
        const ev = data.event;
        if (!ev || !ev.type) return true;

        const isTouch = ev.type.startsWith("touch");
        const isWheel = ev.type.includes("wheel");

        if (isTouch) {
          // On flick release, give a smooth, natural momentum glide
          if (ev.type === "touchend") {
            const absDelta = Math.abs(data.deltaY);
            if (absDelta > 2) {
              data.deltaY =
                Math.sign(data.deltaY) *
                Math.min(550, Math.pow(absDelta * 22, 0.86));
            }
          }

          // Proxy event as "wheel" so Lenis applies full continuous lerp smoothing to touch drag!
          data.event = new Proxy(ev, {
            get(target, prop, receiver) {
              if (prop === "type") return "wheel";
              const val = Reflect.get(target, prop, receiver);
              return typeof val === "function" ? val.bind(target) : val;
            },
          });
        } else if (isWheel) {
          // Softly cap rapid wheel spinning on desktop/laptop
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

