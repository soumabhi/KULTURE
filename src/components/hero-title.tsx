"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedBottle from "./animated-bottle";
import KeycapButton from "./keycap-button";
import PageTransitionOverlay from "./page-transition-overlay";
import styles from "./hero-title.module.css";

export default function HeroTitle() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleExploreClick = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    router.push("/explore");
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>
          <span className={styles.line}>
            Turn Every <AnimatedBottle />
          </span>
          <span className={styles.line}>Into an Experience.</span>
        </h1>

        <p className={styles.subtitle}>
          Physical Media × Digital Experience
        </p>

        {/* Mobile-only Explore Kulture button without icon */}
        <div className={styles.mobileCtaWrapper}>
          <KeycapButton
            type="button"
            className={styles.exploreButton}
            onClick={handleExploreClick}
          >
            Explore Kulture
          </KeycapButton>
        </div>
      </div>

      <PageTransitionOverlay
        isTriggered={isTransitioning}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}
