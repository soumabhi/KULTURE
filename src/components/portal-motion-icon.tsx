"use client";

import styles from "./portal-motion-icon.module.css";

export default function PortalMotionIcon() {
  return (
    <div className={styles.iconContainer} aria-hidden="true">
      {/* Expanding Ambient Radar Waves */}
      <span className={`${styles.sonarRing} ${styles.ring1}`} />
      <span className={`${styles.sonarRing} ${styles.ring2}`} />

      <div className={styles.iconPlate}>
        <svg
          className={styles.svgElement}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Holographic scanner gradient */}
            <linearGradient id="scan-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>

            {/* Gold bottle accent gradient */}
            <linearGradient id="gold-amber" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* 1. Sleek Cultural Bottle Silhouette */}
          {/* Cap & neck */}
          <rect x="29" y="10" width="6" height="3" rx="1.5" fill="#181512" />
          <rect x="30" y="13" width="4" height="4" fill="#181512" />

          {/* Bottle body */}
          <path
            d="M26 19C26 17.5 27.5 17 29 17H35C36.5 17 38 17.5 38 19L41 23C42 24.5 42.5 26 42.5 28V47C42.5 50 40 52 37 52H27C24 52 21.5 50 21.5 47V28C21.5 26 22 24.5 23 23L26 19Z"
            fill="#181512"
          />

          {/* 2. Inner Digital Portal Window */}
          <path
            d="M27.5 24H36.5C38 24 39 25 39 26.5V45C39 46.5 38 47.5 36.5 47.5H27.5C26 47.5 25 46.5 25 45V26.5C25 25 26 24 27.5 24Z"
            fill="#292524"
          />

          {/* 3. Up-and-down laser scanning line */}
          <g className={styles.scanLineGroup}>
            <rect x="23" y="24" width="18" height="3" rx="1" fill="url(#scan-beam)" />
            <line x1="24" y1="25.5" x2="40" y2="25.5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 4. Digital QR Sparkle Nodes */}
          <rect x="28" y="27" width="2.5" height="2.5" rx="0.5" fill="#f59e0b" className={styles.pixel1} />
          <rect x="33.5" y="27" width="2.5" height="2.5" rx="0.5" fill="#f59e0b" className={styles.pixel2} />
          <rect x="28" y="32.5" width="2.5" height="2.5" rx="0.5" fill="#f59e0b" className={styles.pixel3} />
          <rect x="33.5" y="32.5" width="2.5" height="2.5" rx="0.5" fill="#f59e0b" className={styles.pixel4} />

          {/* 5. Floating Heritage Stars ✦ */}
          {/* Star Top-Right */}
          <path
            d="M48 14L49 17L52 18L49 19L48 22L47 19L44 18L47 17L48 14Z"
            fill="#d97706"
            className={styles.star1}
          />
          {/* Star Bottom-Left */}
          <path
            d="M16 42L17 44.5L19.5 45.5L17 46.5L16 49L15 46.5L12.5 45.5L15 44.5L16 42Z"
            fill="#f59e0b"
            className={styles.star2}
          />
        </svg>
      </div>
    </div>
  );
}
