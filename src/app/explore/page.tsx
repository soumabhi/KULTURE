"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedBottle from "@/components/animated-bottle";
import ContactModal, { ModalMode } from "@/components/contact-modal";
import KeycapButton from "@/components/keycap-button";
import styles from "./explore.module.css";

const SYSTEM_STEPS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: "SEE",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M12 12v9M16 12h5" />
      </svg>
    ),
    label: "SCAN",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
    label: "EXPERIENCE",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
      </svg>
    ),
    label: "ENGAGE",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13" />
        <path d="M19 8a4 4 0 0 0-7-2.6 4 4 0 0 0-7 2.6" />
      </svg>
    ),
    label: "REWARD",
  },
];

export default function ExplorePage() {
  const [activeModal, setActiveModal] = useState<ModalMode | null>(null);

  return (
    <main className={styles.container}>
      {/* Top Header Bar with Close Icon on Top Right */}
      <header className={styles.topBar}>
        <Link href="/" className={styles.closeButton} aria-label="Close and return to home">
          ✕
        </Link>
      </header>

      {/* Main Content Area */}
      <div className={styles.contentWrapper}>
        {/* Full Viewport Top-Centered Hero Section */}
        <section className={styles.heroSection}>
          <h1 className={styles.headline}>
            Turn What People Hold
            <br />
            Into Something They Can Experience.
          </h1>

          <div className={styles.bottleShowcase}>
            <AnimatedBottle />
          </div>

          <p className={styles.subtitle}>
            ✦ PHYSICAL MEDIA × DIGITAL EXPERIENCE
          </p>

          <p className={styles.subtext}>
            Kulture transforms everyday physical touchpoints into interactive digital
            experiences—helping brands, venues, and events engage people in a whole new way.
          </p>
        </section>

        {/* The Kulture System Visual Flow Diagram */}
        <section className={`${styles.systemSection} ${styles.revealItem}`} aria-label="The Kulture System Flow">
          <div className={styles.systemHeader}>
            <span className={styles.systemBadge}>HOW IT WORKS</span>
            <h2 className={styles.systemTitle}>The Kulture System</h2>
          </div>

          <div className={styles.systemTrack}>
            {SYSTEM_STEPS.map((step, idx) => (
              <div key={step.label} className={styles.stepItemWrapper}>
                <div className={styles.stepNode}>
                  <span className={styles.stepIconBox}>{step.icon}</span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
                {idx < SYSTEM_STEPS.length - 1 && (
                  <div className={styles.connectorLine}>
                    <span className={styles.connectorDot} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3 Core Story Pillars Grid */}
        <section className={styles.pillarsGrid} aria-label="Kulture Pillars">
          {/* Card 01 */}
          <article className={`${styles.pillarCard} ${styles.revealItem}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconBox}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 2h10M10 2v3M14 2v3M6 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z" />
                  <path d="M10 12h4" />
                </svg>
              </div>
              <span className={styles.stepNum}>01</span>
            </div>
            <h2 className={styles.cardTitle}>It Starts With Something Real.</h2>
            <p className={styles.cardDesc}>
              A bottle, product, or physical space becomes more than something people see—it becomes the starting point of an experience.
            </p>
          </article>

          {/* Card 02 */}
          <article className={`${styles.pillarCard} ${styles.revealItem}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconBox}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3M21 21v.01M12 7v3a2 2 0 0 1-2 2H7M12 12v9M16 12h5" />
                </svg>
              </div>
              <span className={styles.stepNum}>02</span>
            </div>
            <h2 className={styles.cardTitle}>One Scan. A Whole New Experience.</h2>
            <p className={styles.cardDesc}>
              Scan a QR code to instantly unlock information, games, rewards, offers, event updates, and more—right on your phone. No app required.
            </p>
          </article>

          {/* Card 03 */}
          <article className={`${styles.pillarCard} ${styles.revealItem}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconBox}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className={styles.stepNum}>03</span>
            </div>
            <h2 className={styles.cardTitle}>Better Experiences. Real Engagement.</h2>
            <p className={styles.cardDesc}>
              Kulture helps brands, venues, and organizers turn everyday audiences into active participants—not just people who see an advertisement.
            </p>
          </article>
        </section>

        {/* Closing Action Section */}
        <section className={`${styles.closingSection} ${styles.revealItem}`}>
          <h2 className={styles.closingTitle}>
            Don&apos;t Just Be Seen.
            <br />
            Be Experienced.
          </h2>

          <div className={styles.closingButtonWrapper}>
            <KeycapButton
              type="button"
              className={styles.partnerKeycap}
              onClick={() => setActiveModal("partner")}
            >
              Partner With Kulture →
            </KeycapButton>
          </div>
        </section>
      </div>

      {/* Modal Integration */}
      <ContactModal
        mode={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
