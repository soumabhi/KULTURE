"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useNav } from "@/components/nav-provider";
import KeycapButton from "@/components/keycap-button";
import styles from "./why-kulture-section.module.css";

const COMPARISON_CHANNELS = [
  {
    id: "billboard",
    tag: "OUT-OF-HOME (OOH)",
    title: "Traditional Billboards",
    status: "PASSIVE & UNMEASURED",
    statusType: "negative",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="3" rx="2" />
        <path d="m3 9 18 0" />
        <path d="M12 15v6" />
        <path d="M8 21h8" />
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    stats: [
      { label: "Dwell Time", value: "~3 sec", note: "fleeting glance" },
      { label: "Attribution", value: "0%", note: "zero tracking" },
      { label: "Interaction", value: "None", note: "strictly broadcast" },
    ],
    summary:
      "Expensive roadside billboards are glanced at for 3 seconds by commuters on autopilot. You can't click them, you can't measure direct intent, and you can't build a 1:1 relationship.",
    features: [
      { text: "Zero Interactive or Retargeting Capability", type: "negative" },
      { text: "Unverifiable Eyeballs & Broadcast Guesswork", type: "negative" },
      { text: "High Fixed Cost with Zero Direct Lead Capture", type: "negative" },
    ],
  },
  {
    id: "digital",
    tag: "SOCIAL & BANNER ADS",
    title: "Digital Feed Ads",
    status: "FATIGUED & SKIPPED",
    statusType: "negative",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="20" x="5" y="2" rx="2" />
        <path d="M12 18h.01" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    ),
    stats: [
      { label: "Ad Blindness", value: "86%", note: "scrolled past" },
      { label: "Ad-Block", value: ">38%", note: "active avoidance" },
      { label: "Cost Per Click", value: "Rising", note: "fleeting views" },
    ],
    summary:
      "Buried in endless feeds between algorithmic noise. Consumers scroll past in under a second or pay premium subscriptions specifically to avoid and block them.",
    features: [
      { text: "Skipped or Ad-Blocked in Under 1 Second", type: "negative" },
      { text: "Rising CPMs & Saturated Algorithmic Feeds", type: "negative" },
      { text: "Bot Traffic & Zero Physical Touchpoint Presence", type: "negative" },
    ],
  },
  {
    id: "kulture",
    tag: "PHYSICAL × DIGITAL (PHYGITAL)",
    title: "The Kulture Paradigm",
    status: "ACTIVE & IMMERSIVE",
    statusType: "positive",
    icon: null,
    stats: [
      { label: "Dwell Time", value: "25+ min", note: "held in hands" },
      { label: "Attribution", value: "100%", note: "verified scans" },
      { label: "Engagement", value: "Direct", note: "active intent" },
    ],
    summary:
      "A premium physical bottle resting on a table for 30 minutes isn't background noise. One frictionless scan instantly unlocks gamified rewards, AR, stories, and verified first-party engagement.",
    features: [
      { text: "Zero App Download (Instant Camera Web Scan)", type: "positive" },
      { text: "Real-World Consumer Dwell Time (20–45 Mins)", type: "positive" },
      { text: "100% First-Party Data & Direct ROI Attribution", type: "positive" },
    ],
  },
];

function ScrambleLink({
  text,
  href,
  className,
}: {
  text: string;
  href: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number>(0);
  const isScramblingRef = useRef(false);
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#01X$%";

  const startScramble = () => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;

    const chars = text.split("");
    const length = chars.length;
    let iteration = 0;

    cancelAnimationFrame(frameRef.current);

    const update = () => {
      iteration += 1 / 3;
      const scrambled = chars
        .map((char, index) => {
          if (char === " ") return " ";
          if (index < iteration) {
            return text[index];
          }
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(scrambled);

      if (iteration < length) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(text);
        isScramblingRef.current = false;
      }
    };

    frameRef.current = requestAnimationFrame(update);
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={startScramble}
      aria-label={text}
    >
      {displayText}
    </Link>
  );
}

export default function WhyKultureSection() {
  const { openModal } = useNav();

  return (
    <div className={styles.section} aria-label="Why Kulture?">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Why Traditional Ads Don&apos;t Have The Edge.
            <br />
            <span className={styles.titleHighlight}>And Why Physical × Digital Wins.</span>
          </h2>
          <p className={styles.subtitle}>
            People don&apos;t look at billboards anymore, and they skip digital ads in 0.5 seconds.
            Kulture turns everyday real-world products you hold into immersive digital experiences.
          </p>
        </div>

        {/* 3-Channel Comparison Matrix */}
        <div className={styles.cardsGrid}>
          {COMPARISON_CHANNELS.map((item) => {
            const isHero = item.id === "kulture";
            return (
              <div
                key={item.id}
                className={`${styles.card} ${isHero ? styles.heroCard : styles.standardCard}`}
              >
                {isHero && <div className={styles.cardGlow} />}

                <div className={styles.cardTop}>
                  <div className={styles.cardHeader}>
                    {item.icon && <div className={styles.iconWrapper}>{item.icon}</div>}
                    <span className={styles.channelTag}>{item.tag}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div
                    className={`${styles.statusBadge} ${item.statusType === "positive" ? styles.statusPositive : styles.statusNegative
                      }`}
                  >
                    {item.status}
                  </div>
                </div>

                <div className={styles.statsRow}>
                  {item.stats.map((st) => (
                    <div key={st.label} className={styles.statItem}>
                      <span className={styles.statVal}>{st.value}</span>
                      <span className={styles.statLabel}>{st.label}</span>
                      <span className={styles.statNote}>{st.note}</span>
                    </div>
                  ))}
                </div>

                <p className={styles.cardSummary}>{item.summary}</p>

                <div className={styles.featureList}>
                  {item.features.map((feat, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <span
                        className={`${styles.featureIcon} ${feat.type === "positive" ? styles.checkIcon : styles.crossIcon
                          }`}
                      >
                        {feat.type === "positive" ? "✓" : "✕"}
                      </span>
                      <span
                        className={
                          feat.type === "positive"
                            ? styles.featureTextHero
                            : styles.featureText
                        }
                      >
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaHeading}>
              Stop Paying for Skipped Ads.
              <br />
              <span className={styles.ctaHeadingHighlight}>
                Own the 30-Minute Attention Touchpoint.
              </span>
            </h3>
            <p className={styles.ctaSubtext}>
              Transform everyday physical consumer products into interactive web experiences with 100% verified engagement and guaranteed first-party ROI.
            </p>
          </div>

          <div className={styles.ctaActions}>
            <KeycapButton
              type="button"
              className={styles.primaryKeycap}
              onClick={() => openModal("partner")}
            >
              Partner With Us →
            </KeycapButton>
            <ScrambleLink
              href="/explore"
              className={styles.secondaryLink}
              text="Explore Full System ↗"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
