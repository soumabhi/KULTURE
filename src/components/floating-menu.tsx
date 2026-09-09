"use client";

import { useEffect, useState } from "react";
import KeycapButton from "@/components/keycap-button";
import { useNav } from "@/components/nav-provider";
import styles from "./floating-menu.module.css";

export default function FloatingMenu() {
  const { isMenuOpen, openMenu } = useNav();
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const threshold = window.innerHeight * 0.5;
          const past = window.scrollY > threshold;
          setIsPastHero((prev) => (prev !== past ? past : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div
      className={`${styles.floatingTrigger} ${isPastHero ? styles.floatingVisible : ""}`}
      aria-hidden={!isPastHero}
    >
      <KeycapButton
        type="button"
        className={styles.iconKeycap}
        onClick={openMenu}
        aria-label="Open navigation menu"
        aria-expanded={isMenuOpen}
        tabIndex={isPastHero ? 0 : -1}
      >
        <span className={styles.iconSymbol}>↗</span>
      </KeycapButton>
    </div>
  );
}
