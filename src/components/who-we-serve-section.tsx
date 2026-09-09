"use client";

import styles from "./who-we-serve-section.module.css";

const STAKEHOLDERS = [
  {
    tag: "ENTERPRISE & D2C BRANDS",
    title: "Brands & Advertisers",
    status: "100% CAPTIVE AUDIENCE",
    isHero: false,
    stats: [
      { label: "Ad-Block", value: "0%", note: "physical reality" },
      { label: "Real Human", value: "100%", note: "zero bot fraud" },
      { label: "Engagement", value: "Direct", note: "active intent" },
    ],
    desc: "Command uninterrupted real-world attention in premium dining, campus, and luxury environments without paying for skipped impressions, bot clicks, or algorithm tax.",
    features: [
      "Zero ad-block bypass barrier",
      "Real-time QR web attribution tracking",
      "Guaranteed captive dwell time",
      "1:1 first-party lead acquisition",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    tag: "HOTELS, CLUBS & VENUES",
    title: "Venue Hosts & Hospitality",
    status: "ZERO-COST HYDRATION",
    isHero: true,
    stats: [
      { label: "Water Cost", value: "₹0", note: "free inventory" },
      { label: "Scan Revenue", value: "20–35%", note: "passive share" },
      { label: "Guest Perception", value: "5-Star", note: "custom label" },
    ],
    desc: "Provide guests with luxury, custom-branded bottled water completely free of cost while unlocking an ongoing, passive monthly revenue stream generated on every brand scan.",
    features: [
      "100% free premium water supply",
      "Custom co-branded label design",
      "Monthly passive monetization payout",
      "Elevated guest service perception",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    ),
  },
  {
    tag: "CONSUMERS & GUESTS",
    title: "Everyday Drinkers & Guests",
    status: "DELIGHTFUL & REWARDING",
    isHero: false,
    stats: [
      { label: "Install Required", value: "0 App", note: "browser instant" },
      { label: "Surprise Perks", value: "Instant", note: "coupons & coins" },
      { label: "WebAR", value: "Gamified", note: "scratch & win" },
    ],
    desc: "Transform a routine sip of water into an unexpected moment of joy with instant scratch rewards, exclusive vouchers, and interactive Web experiences right from your phone.",
    features: [
      "Zero app installation required",
      "Instant scratch coupons & discounts",
      "Playful 3D AR filters & trivia",
      "Free premium eco-bottled water",
    ],
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v10H4V12" />
        <path d="M2 7h20v5H2z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
];

export default function WhoWeServeSection() {
  return (
    <div className={styles.section} aria-label="Who We Serve">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Engineered for Brands. Loved by Venues.
            <br />
            <span className={styles.titleHighlight}>Rewarding for People.</span>
          </h2>
          <p className={styles.subtitle}>
            Three distinct stakeholders in a symbiotic phygital economy where nobody
            gets interrupted and everyone gains real value.
          </p>
        </div>

        {/* 3 Columns */}
        <div className={styles.cardsGrid}>
          {STAKEHOLDERS.map((col) => (
            <div
              key={col.title}
              className={`${styles.card} ${col.isHero ? styles.heroCard : ""}`}
            >
              <div className={styles.cardTop}>
                <div
                  className={`${styles.iconWrap} ${col.isHero ? styles.heroIconWrap : ""}`}
                >
                  {col.icon}
                </div>
                <span
                  className={`${styles.stakeholderTag} ${col.isHero ? styles.heroTag : ""}`}
                >
                  {col.tag}
                </span>
              </div>

              <h3
                className={`${styles.cardTitle} ${col.isHero ? styles.heroTitle : ""}`}
              >
                {col.title}
              </h3>
              <span
                className={`${styles.statusPill} ${col.isHero ? styles.heroStatusPill : ""}`}
              >
                {col.status}
              </span>

              {/* Stats Row */}
              <div
                className={`${styles.statsRow} ${col.isHero ? styles.heroStatsRow : ""}`}
              >
                {col.stats.map((st) => (
                  <div key={st.label} className={styles.statItem}>
                    <span
                      className={`${styles.statVal} ${col.isHero ? styles.heroStatVal : ""}`}
                    >
                      {st.value}
                    </span>
                    <span
                      className={`${styles.statLabel} ${col.isHero ? styles.heroStatLabel : ""}`}
                    >
                      {st.label}
                    </span>
                    <span className={styles.statNote}>{st.note}</span>
                  </div>
                ))}
              </div>

              <p
                className={`${styles.cardDesc} ${col.isHero ? styles.heroDesc : ""}`}
              >
                {col.desc}
              </p>

              {/* Feature Checklist */}
              <div className={styles.featureList}>
                {col.features.map((feat) => (
                  <div
                    key={feat}
                    className={`${styles.featureItem} ${col.isHero ? styles.heroFeatureItem : ""}`}
                  >
                    <svg
                      className={`${styles.checkIcon} ${col.isHero ? styles.heroCheckIcon : ""}`}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
