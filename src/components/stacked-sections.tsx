"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./stacked-sections.module.css";

type StackedSectionsProps = {
  heroChildren: ReactNode;
  whyKultureChildren: ReactNode;
  whatWeDoChildren?: ReactNode;
  whereWeDoChildren?: ReactNode;
  whoWeServeChildren?: ReactNode;
  whoWeAreChildren?: ReactNode;
};

export default function StackedSections({
  heroChildren,
  whyKultureChildren,
  whatWeDoChildren,
  whereWeDoChildren,
  whoWeServeChildren,
  whoWeAreChildren,
}: StackedSectionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contentStageRef = useRef<HTMLDivElement>(null);

  // 1. Clean URL hash & set manual scroll restoration on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  // 2. Setup GSAP Hero Curtain Reveal & Fluid Micro-Animations (GSAP Master Patterns)
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Performance configurations: align with Lenis for continuous 60/120fps
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ limitCallbacks: true });

    const ctx = gsap.context(() => {
      const hero = heroRef.current;
      const contentStage = contentStageRef.current;
      if (!hero || !contentStage) return;

      const mm = gsap.matchMedia();

      // Responsive configuration
      mm.add(
        {
          isDesktop: "(min-width: 769px)",
          isMobile: "(max-width: 768px)",
        },
        (context) => {
          const { isDesktop } = context.conditions as { isDesktop: boolean; isMobile: boolean };

          // Hero scale-down into depth as content stage slides over it (smooth 0.5s scrub)
          gsap.to(hero, {
            scale: isDesktop ? 0.88 : 0.94,
            opacity: isDesktop ? 0.15 : 0.22,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: contentStage,
              start: "top bottom",
              end: "top top",
              scrub: 0.5,
              fastScrollEnd: true,
              preventOverlaps: true,
              onLeave: () => {
                hero.style.visibility = "hidden";
                hero.style.pointerEvents = "none";
              },
              onEnterBack: () => {
                hero.style.visibility = "visible";
                hero.style.pointerEvents = "auto";
              },
            },
          });
        }
      );

      // Staggered reveal micro-animations for body sections (Optimized 120fps)
      const sections = contentStage.querySelectorAll<HTMLElement>(`.${styles.bodySection}`);
      sections.forEach((sec) => {
        const header = sec.querySelector<HTMLElement>("[class*='header']");
        if (header) {
          gsap.fromTo(
            header,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform",
              scrollTrigger: {
                trigger: header,
                start: "top 88%",
                once: true,
              },
            }
          );
        }

        // Target only top-level card elements inside grids
        const cards = sec.querySelectorAll<HTMLElement>(
          "[class*='grid'] > div, [class*='Grid'] > div, [class*='cardsGrid'] > div, [class*='hubsGrid'] > div"
        );
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.06,
              ease: "power2.out",
              force3D: true,
              clearProps: "transform",
              scrollTrigger: {
                trigger: sec,
                start: "top 85%",
                once: true,
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    // Instantaneous scroll guard: guarantees hero is hidden when scrolled past
    const hero = heroRef.current;
    let wasPast = false;
    const syncHeroVisibility = () => {
      if (!hero) return;
      const past = window.scrollY >= window.innerHeight * 0.92;
      if (past !== wasPast) {
        wasPast = past;
        hero.style.visibility = past ? "hidden" : "visible";
        hero.style.pointerEvents = past ? "none" : "auto";
      }
    };
    window.addEventListener("scroll", syncHeroVisibility, { passive: true });
    syncHeroVisibility();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      window.removeEventListener("scroll", syncHeroVisibility);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.slidesWrapper}>
      {/* ── Fixed Hero Stage (Pinned 3D Depth Card) ── */}
      <section id="home" ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroInner}>{heroChildren}</div>
      </section>

      {/* ── Luxury Content Curtain (Slides over Hero, then flows natively) ── */}
      <div ref={contentStageRef} className={styles.contentStage}>
        {/* Section 2: Why Kulture */}
        <section id="why-kulture" className={styles.bodySection}>
          {whyKultureChildren}
        </section>

        {/* Section 3: What We Do */}
        {whatWeDoChildren && (
          <section id="what-we-do" className={styles.bodySection}>
            {whatWeDoChildren}
          </section>
        )}

        {/* Section 4: Where We Do */}
        {whereWeDoChildren && (
          <section id="where-we-do" className={styles.bodySection}>
            {whereWeDoChildren}
          </section>
        )}

        {/* Section 5: Who We Serve */}
        {whoWeServeChildren && (
          <section id="who-we-serve" className={styles.bodySection}>
            {whoWeServeChildren}
          </section>
        )}

        {/* Section 6: Who We Are */}
        {whoWeAreChildren && (
          <section id="who-we-are" className={styles.bodySection}>
            {whoWeAreChildren}
          </section>
        )}
      </div>
    </div>
  );
}
