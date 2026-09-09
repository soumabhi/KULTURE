"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./sliding-menu.module.css";

const MENU_ITEMS = [
  { label: "Why Kulture?", targetId: "why-kulture" },
  { label: "What we do?", targetId: "what-we-do" },
  { label: "Where we do?", targetId: "where-we-do" },
  { label: "Who we serve?", targetId: "who-we-serve" },
  { label: "Who we are?", targetId: "who-we-are" },
];

type SlidingMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenPartnerModal?: () => void;
};

export default function SlidingMenu({
  isOpen,
  onClose,
  onOpenPartnerModal,
}: SlidingMenuProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const enterEndTimeRef = useRef(0);
  const isFirstRender = useRef(true);
  const exitSpeed = 1.4;

  // Build the single interruptible timeline with .addPause()
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    // Initial positioning
    gsap.set(nav, { visibility: "hidden", pointerEvents: "none" });
    gsap.set(nav.querySelector(`.${styles.navBg}`), { opacity: 0 });
    gsap.set(nav.querySelectorAll(`.${styles.navPanel}`), {
      x: "110%",
      y: 0,
      rotation: 0,
    });
    gsap.set(nav.querySelector(`.${styles.navBrochure}`), { opacity: 0, y: 8 });

    const tl = gsap.timeline({ paused: true });
    tlRef.current = tl;

    tl.set(nav, { visibility: "visible", pointerEvents: "auto" })
      // ═══ ENTER ═══
      .to(
        nav.querySelector(`.${styles.navBg}`),
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0
      )
      .fromTo(
        nav.querySelectorAll(`.${styles.navPanel}`),
        { x: "110%", y: 0, rotation: 0 },
        {
          x: "0%",
          y: 0,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.1)",
          stagger: 0.1,
        },
        0
      )
      .fromTo(
        nav.querySelectorAll(`.${styles.navItem}`),
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.03,
        },
        0.1
      )
      .to(
        nav.querySelector(`.${styles.navBrochure}`),
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out",
        },
        0.35
      )
      // ═══ PAUSE ═══
      .addPause();

    enterEndTimeRef.current = tl.duration();

    // ═══ EXIT — panels fall down with stagger, bottom first ═══
    tl.to(
      nav.querySelectorAll(`.${styles.navPanel}`),
      {
        y: "110vh",
        rotation: () => gsap.utils.random(-25, 25),
        duration: 1,
        ease: "power3.in",
        stagger: {
          from: "end",
          each: 0.02,
        },
      },
      "<"
    )
      .to(
        nav.querySelector(`.${styles.navBg}`),
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        "<0.1"
      )
      .set(nav, { visibility: "hidden", pointerEvents: "none" });

    return () => {
      tl.kill();
    };
  }, []);

  // Handle open/close state transitions through the single timeline
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const tl = tlRef.current;
    const enterEndTime = enterEndTimeRef.current;
    if (!tl) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (tl.time() >= enterEndTime) {
        tl.timeScale(1).restart();
      } else {
        tl.timeScale(1).play();
      }
    } else {
      document.body.style.overflow = "";
      if (tl.time() < enterEndTime) {
        tl.timeScale(exitSpeed).reverse();
      } else {
        tl.timeScale(exitSpeed).play();
      }
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      ref={navRef}
      className={styles.nav}
      id="nav"
      aria-hidden={!isOpen}
    >
      <div
        className={styles.navBg}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close overlay"
      />

      {/* Top panel — cream / white */}
      <div className={`${styles.navTop} ${styles.navBorder} ${styles.navPanel}`} id="navTop">
        <div className={styles.navTopHeader}>
          <span className={styles.navTopBrand}>KULTURE MENU</span>
          <button
            type="button"
            className={styles.panelCloseBtn}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className={styles.navList}>
          {MENU_ITEMS.map((item) => (
            <li key={item.label} className={styles.navItem}>
              <button
                type="button"
                className={styles.navLink}
                onClick={() => {
                  onClose();
                  if (typeof window === "undefined") return;

                  if (window.location.pathname !== "/") {
                    window.location.href = `/?section=${item.targetId}`;
                    return;
                  }

                  document.body.style.overflow = "";
                  setTimeout(() => {
                    const target = document.getElementById(item.targetId);
                    if (target) {
                      const rect = target.getBoundingClientRect();
                      const scrollTop = window.scrollY || document.documentElement.scrollTop;
                      const targetY = rect.top + scrollTop;
                      window.scrollTo({
                        top: targetY,
                        behavior: "smooth",
                      });
                    }
                  }, 50);
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.navBrochure}>
          <a
            href="/brochure.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.brochureLink}
            onClick={onClose}
          >
            <span>Download Brochure</span>
            <span className={styles.brochureIcon}>↗</span>
          </a>
        </div>
      </div>

      {/* Bottom panel — black (Temporarily commented out for later embedding) */}
      {/*
      <div className={`${styles.navBottom} ${styles.navBorder} ${styles.navPanel}`} id="navBottom">
        <ul className={styles.navSocials}>
          <li>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
          </li>
          <li>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </li>
        </ul>
      </div>
      */}
    </div>
  );
}
