"use client";

import styles from "./where-we-do-section.module.css";

const HUBS = [
  {
    tag: "High Affluence",
    title: "Luxury Hospitality & Hotels",
    subtitle: "Guest Suites • Banquet Halls • VIP Amenities",
    desc: "A premium bedside and dining companion that affluent travelers hold, inspect, and enjoy at their leisure over extended stays.",
    dwell: "45+ Mins",
    dwellLabel: "Average In-Room Presence",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4v16" />
        <path d="M2 8h18a2 2 0 0 1 2 2v10" />
        <path d="M2 17h20" />
        <path d="M6 8v9" />
      </svg>
    ),
  },
  {
    tag: "Ad-Blocked Users",
    title: "Tech Campuses & Co-Working",
    subtitle: "Boardrooms • Tech Cafeterias • Developer Summits",
    desc: "Direct desktop real estate among software engineers, founders, and executives who actively avoid and block all digital banner ads.",
    dwell: "60+ Mins",
    dwellLabel: "Desk & Meeting Dwell",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="4" rx="2" />
        <line x1="2" x2="22" y1="20" y2="20" />
      </svg>
    ),
  },
  {
    tag: "Social & Captive",
    title: "High-End Cafes & Eateries",
    subtitle: "Dine-In Tabletops • Lounge Waiting Areas",
    desc: "Placed right in front of customers awaiting their meal or mid-conversation—an irresistible, frictionless trigger for interactive perks.",
    dwell: "35+ Mins",
    dwellLabel: "Tabletop Dwell Time",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" />
        <line x1="10" x2="10" y1="2" y2="4" />
        <line x1="14" x2="14" y1="2" y2="4" />
      </svg>
    ),
  },
  {
    tag: "High Virality",
    title: "Festivals & Cultural Events",
    subtitle: "Music Concerts • Design Expos • Marathon Stations",
    desc: "Held in active movement amidst heightened sensory energy. Generates mass peer visibility, instant UGC sharing, and viral redemption.",
    dwell: "3–5 Hours",
    dwellLabel: "Event Lifecycle Contact",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  },
  {
    tag: "Premium HNIs",
    title: "Transit & Airport Lounges",
    subtitle: "Departure Terminals • Executive Airport Lounges",
    desc: "Accompanies high-net-worth passengers throughout idle gate dwell, providing calm, captive engagement when digital devices are resting.",
    dwell: "50+ Mins",
    dwellLabel: "Gate & Lounge Dwell",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </svg>
    ),
  },
];

const NETWORK_STATS = [
  { value: "100%", label: "Real Human Scans", note: "Zero bot traffic or simulated clicks" },
  { value: "30+ Min", label: "Average Table Dwell", note: "Held in real hands while dining & working" },
  { value: "0 App", label: "Zero Install Barrier", note: "Instant camera scan in any mobile browser" },
];

export default function WhereWeDoSection() {
  return (
    <div className={styles.section} aria-label="Where We Do">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Where Attention Lives.
            <br />
            <span className={styles.titleHighlight}>Not Where It&apos;s Avoided.</span>
          </h2>
          <p className={styles.subtitle}>
            We place brands into spaces where real people sit, unwind, and stay for 30+
            minutes—transforming dead time into active brand discovery.
          </p>
        </div>

        {/* 5-Hubs Grid */}
        <div className={styles.hubsGrid}>
          {HUBS.map((hub) => (
            <div key={hub.title} className={styles.hubCard}>
              <div className={hubTopClass(styles)}>
                <div className={styles.hubIconWrap}>{hub.icon}</div>
                <span className={styles.hubTag}>{hub.tag}</span>
              </div>

              <h3 className={styles.hubTitle}>{hub.title}</h3>
              <span className={styles.hubSub}>{hub.subtitle}</span>
              <p className={styles.hubDesc}>{hub.desc}</p>

              <div className={styles.hubDwell}>
                <span className={styles.dwellLabel}>{hub.dwellLabel}</span>
                <span className={styles.dwellVal}>{hub.dwell}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Network Metrics Bar */}
        <div className={styles.networkBar}>
          {NETWORK_STATS.map((stat) => (
            <div key={stat.label} className={styles.networkItem}>
              <span className={styles.networkVal}>{stat.value}</span>
              <span className={styles.networkLabel}>{stat.label}</span>
              <span className={styles.networkNote}>{stat.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function hubTopClass(styles: Record<string, string>) {
  return styles.hubTop;
}
