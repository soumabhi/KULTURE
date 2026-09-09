"use client";

import { useNav } from "@/components/nav-provider";
import KeycapButton from "@/components/keycap-button";
import styles from "./what-we-do-section.module.css";

/* ── Colorful SVG 1: Physical Dwell Touchpoint ── */
function TouchpointColorfulGraphic() {
  return (
    <div className={styles.bottleStage}>
      {/* Floor Contact Ground Shadow Under Bottle */}
      <div className={styles.bottleFloorShadow} />

      <svg
        className={styles.touchpointBottle}
        viewBox="0 0 42 98"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Water bottle physical touchpoint"
        role="img"
      >
        <defs>
          {/* Clip path of the bottle interior strictly stopping below neck */}
          <clipPath id="touchpoint-bottle-interior">
            <path d="M 14,26 C 14,24 16,22 18,22 L 24,22 C 26,22 28,24 28,26 L 35,29 C 37,30 38,32 38,34.5 L 38,89 C 38,92.5 35.5,95 32,95 L 10,95 C 6.5,95 4,92.5 4,89 L 4,34.5 C 4,32 5,30 7,29 Z" />
          </clipPath>

          {/* Water liquid gradient */}
          <linearGradient id="touchpoint-water-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>

          {/* Metallic cap / neck thread gradient */}
          <linearGradient id="touchpoint-metal-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="25%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="75%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Glass reflection highlight */}
          <linearGradient id="touchpoint-glass-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Bottle wrapper 3D cylindrical paper label gradient */}
          <linearGradient id="touchpoint-wrapper-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="12%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="88%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* 1. Translucent bottle back & fill container */}
        <path
          d="M 14,22 C 14,17.5 16,16 16,16 L 26,16 C 26,16 28,17.5 28,22 L 35.5,26.5 C 37.5,27.8 38.5,30 38.5,32.5 L 38.5,89.5 C 38.5,93 35.5,95.5 32,95.5 L 10,95.5 C 6.5,95.5 3.5,93 3.5,89.5 L 3.5,32.5 C 3.5,30 4.5,27.8 6.5,26.5 Z"
          fill="rgba(240, 248, 255, 0.65)"
          stroke="#94a3b8"
          strokeWidth="1.2"
        />

        {/* 1b. Bottle bottom glass base inner refraction shadow */}
        <path
          d="M 5,91 C 5,94 8,95.5 12,95.5 L 30,95.5 C 34,95.5 37,94 37,91 C 37,93.2 34,95 30,95 L 12,95 C 8,95 5,93.2 5,91 Z"
          fill="#0f172a"
          opacity="0.32"
        />

      {/* 2. Water liquid (clipped strictly below neck) */}
      <g clipPath="url(#touchpoint-bottle-interior)">
        <g className={styles.waterFill}>
          {/* Wave top surface */}
          <path
            className={styles.waveSurface}
            d="M -4,22 Q 8,18 21,22 T 46,22 L 46,98 L -4,98 Z"
            fill="url(#touchpoint-water-grad)"
          />

          {/* Water shine/glow highlight */}
          <path
            d="M 6,24 L 10,24 L 10,92 L 6,92 Z"
            fill="#ffffff"
            opacity="0.3"
          />

          {/* Animated rising bubbles */}
          <circle className={styles.bubble1} cx="16" cy="72" r="1.5" fill="#ffffff" />
          <circle className={styles.bubble2} cx="27" cy="62" r="1.8" fill="#ffffff" />
          <circle className={styles.bubble3} cx="21" cy="80" r="1.2" fill="#ffffff" />
        </g>
      </g>

      {/* 3. Physical Bottle Wrapper Label with Scannable QR Code */}
      <g>
        {/* Wrapper Label Surface */}
        <rect
          x="4.5"
          y="46"
          width="33"
          height="28"
          rx="1"
          fill="url(#touchpoint-wrapper-grad)"
          stroke="#94a3b8"
          strokeWidth="0.6"
        />
        {/* Vibrant Emerald Accent Edges */}
        <line x1="4.5" y1="46.5" x2="37.5" y2="46.5" stroke="#0ae448" strokeWidth="1" />
        <line x1="4.5" y1="73.5" x2="37.5" y2="73.5" stroke="#0ae448" strokeWidth="1" />

        {/* QR Code White Backing Plate */}
        <rect
          x="10.5"
          y="49.5"
          width="21"
          height="21"
          rx="2"
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth="0.5"
        />

        {/* Exact QR Code Vector SVG Provided by User */}
        <svg
          x="10.5"
          y="49.5"
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="#0f172a"
        >
          <path d="M3 9h6V3H3zm1-5h4v4H4zm1 1h2v2H5zm10 4h6V3h-6zm1-5h4v4h-4zm1 1h2v2h-2zM3 21h6v-6H3zm1-5h4v4H4zm1 1h2v2H5zm15 2h1v2h-2v-3h1zm0-3h1v1h-1zm0-1v1h-1v-1zm-10 2h1v4h-1v-4zm-4-7v2H4v-1H3v-1h3zm4-3h1v1h-1zm3-3v2h-1V3h2v1zm-3 0h1v1h-1zm10 8h1v2h-2v-1h1zm-1-2v1h-2v2h-2v-1h1v-2h3zm-7 4h-1v-1h-1v-1h2v2zm6 2h1v1h-1zm2-5v1h-1v-1zm-9 3v1h-1v-1zm6 5h1v2h-2v-2zm-3 0h1v1h-1v1h-2v-1h1v-1zm0-1v-1h2v1zm0-5h1v3h-1v1h-1v1h-1v-2h-1v-1h3v-1h-1v-1zm-9 0v1H4v-1zm12 4h-1v-1h1zm1-2h-2v-1h2zM8 10h1v1H8v1h1v2H8v-1H7v1H6v-2h1v-2zm3 0V8h3v3h-2v-1h1V9h-1v1zm0-4h1v1h-1zm-1 4h1v1h-1zm3-3V6h1v1z" />
        </svg>
      </g>

      {/* 4. Glass specular glare / shine on left edge */}
      <path
        d="M 7,32 C 7,30 7.8,28.5 9,28 L 9,90 C 7.8,89.5 7,88 7,86 Z"
        fill="url(#touchpoint-glass-shine)"
      />

      {/* 5. Glass outline border */}
      <path
        d="M 14,22 C 14,17.5 16,16 16,16 L 26,16 C 26,16 28,17.5 28,22 L 35.5,26.5 C 37.5,27.8 38.5,30 38.5,32.5 L 38.5,89.5 C 38.5,93 35.5,95.5 32,95.5 L 10,95.5 C 6.5,95.5 3.5,93 3.5,89.5 L 3.5,32.5 C 3.5,30 4.5,27.8 6.5,26.5 Z"
        fill="none"
        stroke="#64748b"
        strokeWidth="1.3"
      />

      {/* 6. Metallic neck & thread ring collar */}
      <rect
        x="13"
        y="15"
        width="16"
        height="3"
        rx="1"
        fill="url(#touchpoint-metal-grad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      <rect
        x="15"
        y="6"
        width="12"
        height="10"
        fill="url(#touchpoint-metal-grad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      <rect
        x="14"
        y="7"
        width="14"
        height="2.2"
        rx="0.8"
        fill="url(#touchpoint-metal-grad)"
        stroke="#334155"
        strokeWidth="0.6"
      />
      <rect
        x="14"
        y="11"
        width="14"
        height="2.2"
        rx="0.8"
        fill="url(#touchpoint-metal-grad)"
        stroke="#334155"
        strokeWidth="0.6"
      />
      </svg>
    </div>
  );
}

/* ── Colorful SVG 2: Instant iPhone Camera Scan (Matching User Reference) ── */
function ScanColorfulGraphic() {
  return (
    <svg
      className={styles.scanDeviceGraphic}
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Instant iPhone QR camera scan"
      role="img"
    >
      <defs>
        {/* Screen Glass Surface Gradient (Matching Reference) */}
        <linearGradient id="iphoneScreenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f8fd" />
          <stop offset="50%" stopColor="#eaf3fb" />
          <stop offset="100%" stopColor="#deedfa" />
        </linearGradient>

        {/* Dynamic Laser Beam Glow Gradient */}
        <linearGradient id="laserBeamGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(10, 228, 72, 0)" />
          <stop offset="60%" stopColor="rgba(10, 228, 72, 0.2)" />
          <stop offset="100%" stopColor="rgba(10, 228, 72, 0.6)" />
        </linearGradient>

        {/* Ambient Soft Glow Behind iPhone */}
        <radialGradient id="iphoneAuraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(186, 230, 253, 0.4)" />
          <stop offset="60%" stopColor="rgba(209, 250, 229, 0.2)" />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </radialGradient>
      </defs>

      {/* Ambient Soft Glow */}
      <circle cx="120" cy="70" r="54" fill="url(#iphoneAuraGlow)" />

      {/* Floating iPhone Container with Organic Levitation */}
      <g className={styles.phoneFloatGroup}>
        {/* Soft Ground Contact Shadow (Matching Reference) */}
        <ellipse cx="120" cy="133" rx="28" ry="4" fill="#cbd5e1" opacity="0.8" />

        {/* ── Side Hardware Buttons (Matching Reference) ── */}
        {/* Left Side: Volume Up */}
        <rect x="87.5" y="34" width="2.8" height="11" rx="1.4" fill="#222638" />
        {/* Left Side: Volume Down */}
        <rect x="87.5" y="48" width="2.8" height="11" rx="1.4" fill="#222638" />
        {/* Right Side: Power Button */}
        <rect x="149.7" y="36" width="2.8" height="16" rx="1.4" fill="#222638" />

        {/* ── iPhone Body & Screen (Matching Reference) ── */}
        {/* Main Chassis with Bold Outline */}
        <rect
          x="90"
          y="11"
          width="60"
          height="116"
          rx="17"
          fill="url(#iphoneScreenGrad)"
          stroke="#222638"
          strokeWidth="3.2"
        />

        {/* Specular Glass Corner Glare Wedge (Matching Reference) */}
        <path
          d="M 91.8,92 C 92,108 103,125 120,125.5 L 102,125.5 C 95,125.5 91.8,118 91.8,110 Z"
          fill="#ffffff"
          opacity="0.55"
        />
        {/* Right Edge Glass Sheen */}
        <path
          d="M 143,14 C 147,19 148.2,26 148.2,40 L 148.2,104 C 148.2,114 145,122 142,124 L 142,14 Z"
          fill="#ffffff"
          opacity="0.35"
        />

        {/* ── Apple Dynamic Island Pill (Matching Reference) ── */}
        <rect
          x="108.5"
          y="16.5"
          width="23"
          height="7"
          rx="3.5"
          fill="#222638"
        />
        {/* Speaker Slit */}
        <rect x="111.5" y="19" width="9.5" height="2" rx="1" fill="#121520" />
        {/* Front Camera Dot */}
        <circle cx="126" cy="20" r="1.6" fill="#121520" />
        <circle cx="126.3" cy="19.7" r="0.5" fill="#38bdf8" />

        {/* ── iOS Camera Viewfinder Focus Reticle (Emerald Neon) ── */}
        <g className={styles.reticlePulse}>
          {/* Top-Left Bracket */}
          <path d="M 103,49 L 103,44 A 2.5 2.5 0 0 1 105.5,41.5 L 110.5,41.5" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
          {/* Top-Right Bracket */}
          <path d="M 129.5,41.5 L 134.5,41.5 A 2.5 2.5 0 0 1 137,44 L 137,49" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
          {/* Bottom-Left Bracket */}
          <path d="M 103,73 L 103,78 A 2.5 2.5 0 0 0 105.5,80.5 L 110.5,80.5" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
          {/* Bottom-Right Bracket */}
          <path d="M 129.5,80.5 L 134.5,80.5 A 2.5 2.5 0 0 0 137,78 L 137,73" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ── Scanned QR Code Inside Viewfinder (Exact User QR Code) ── */}
        <svg
          x="105"
          y="45"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="#1e293b"
        >
          <path d="M3 9h6V3H3zm1-5h4v4H4zm1 1h2v2H5zm10 4h6V3h-6zm1-5h4v4h-4zm1 1h2v2h-2zM3 21h6v-6H3zm1-5h4v4H4zm1 1h2v2H5zm15 2h1v2h-2v-3h1zm0-3h1v1h-1zm0-1v1h-1v-1zm-10 2h1v4h-1v-4zm-4-7v2H4v-1H3v-1h3zm4-3h1v1h-1zm3-3v2h-1V3h2v1zm-3 0h1v1h-1zm10 8h1v2h-2v-1h1zm-1-2v1h-2v2h-2v-1h1v-2h3zm-7 4h-1v-1h-1v-1h2v2zm6 2h1v1h-1zm2-5v1h-1v-1zm-9 3v1h-1v-1zm6 5h1v2h-2v-2zm-3 0h1v1h-1v1h-2v-1h1v-1zm0-1v-1h2v1zm0-5h1v3h-1v1h-1v1h-1v-2h-1v-1h3v-1h-1v-1zm-9 0v1H4v-1zm12 4h-1v-1h1zm1-2h-2v-1h2zM8 10h1v1H8v1h1v2H8v-1H7v1H6v-2h1v-2zm3 0V8h3v3h-2v-1h1V9h-1v1zm0-4h1v1h-1zm-1 4h1v1h-1zm3-3V6h1v1z" />
        </svg>

        {/* ── Sweeping Laser Beam Over QR Code ── */}
        <g className={styles.laserSweepColor}>
          <rect x="101" y="34" width="38" height="10" fill="url(#laserBeamGlow)" />
          <line
            x1="100"
            y1="44"
            x2="140"
            y2="44"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="drop-shadow(0 0 5px #10b981)"
          />
        </g>

        {/* ── Apple Home Indicator Bar (Matching Reference) ── */}
        <rect x="108" y="117" width="24" height="2.4" rx="1.2" fill="#94a3b8" />
      </g>
    </svg>
  );
}

/* ── Colorful SVG 3: Fun Games & Rewards (Pure Vector, No Text) ── */
function RewardsColorfulGraphic() {
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svgGraphic}
      aria-label="Gamified rewards and voucher animation"
    >
      {/* Subtle Ground Contact Glow / Shadow */}
      <ellipse cx="160" cy="104" rx="56" ry="7" fill="rgba(245, 79, 51, 0.08)" />
      <ellipse cx="64" cy="116" rx="36" ry="6" fill="rgba(69, 143, 222, 0.12)" />

      {/* SVG 2: VIP Discount Ticket Voucher (Behind Badge) */}
      <g
        className={styles.rewardTicketBob}
        filter="drop-shadow(0 6px 14px rgba(245, 79, 51, 0.16)) drop-shadow(0 2px 5px rgba(0, 0, 0, 0.06))"
      >
        <svg x="88" y="44" width="138" height="54" viewBox="0 135 480 185">
          <g transform="translate(0 -540.36)">
            <path
              fill="#FFF1EB"
              d="M37.413,680.848c-1.924,20.886-17.874,37.07-37.413,37.962v123.075 c19.559,0.877,35.53,17.079,37.445,37.987h405.142c1.924-20.886,17.874-37.07,37.413-37.962V718.835 c-19.559-0.877-35.53-17.079-37.444-37.987L37.413,680.848L37.413,680.848z"
            />
            <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
              <path fill="#F54F33" d="M74.65,715.816h9.703v-4.852H74.65V715.816z" />
              <path fill="#F54F33" d="M103.757,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M132.862,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M161.968,715.816h9.703v-4.852h-9.703V715.816z" />
              <path fill="#F54F33" d="M191.073,715.816h9.703v-4.852h-9.703V715.816z" />
              <path fill="#F54F33" d="M220.181,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M249.286,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M278.392,715.816h9.703v-4.852h-9.703V715.816z" />
              <path fill="#F54F33" d="M307.499,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M336.605,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M365.71,715.816h9.703v-4.852h-9.703V715.816z" />
              <path fill="#F54F33" d="M394.816,715.816h9.703v-4.852h-9.703V715.816z" />
              <path fill="#F54F33" d="M423.923,715.816h9.701v-4.852h-9.701V715.816z" />
              <path fill="#F54F33" d="M432.03,741.664h4.852v-9.703h-4.852V741.664z" />
              <path fill="#F54F33" d="M43.118,769.492h4.852v-9.701h-4.852V769.492z" />
              <path fill="#F54F33" d="M432.03,770.769h4.852v-9.701h-4.852V770.769z" />
              <path fill="#F54F33" d="M43.118,798.599h4.852v-9.703h-4.852V798.599z" />
              <path fill="#F54F33" d="M432.03,799.875h4.852v-9.701h-4.852V799.875z" />
              <path fill="#F54F33" d="M43.118,827.705h4.852v-9.703h-4.852V827.705z" />
              <path fill="#F54F33" d="M432.03,828.982h4.852v-9.703h-4.852V828.982z" />
              <path fill="#F54F33" d="M74.429,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M103.534,849.756h9.701v-4.85h-9.701L103.534,849.756z" />
              <path fill="#F54F33" d="M132.64,849.756h9.703v-4.85h-9.703V849.756z" />
              <path fill="#F54F33" d="M161.745,849.756h9.703v-4.85h-9.703V849.756z" />
              <path fill="#F54F33" d="M190.853,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M219.958,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M249.064,849.756h9.703v-4.85h-9.703V849.756z" />
              <path fill="#F54F33" d="M278.169,849.756h9.703v-4.85h-9.703V849.756z" />
              <path fill="#F54F33" d="M307.276,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M336.382,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M365.487,849.756h9.703v-4.85h-9.703V849.756z" />
              <path fill="#F54F33" d="M394.595,849.756h9.701v-4.85h-9.701V849.756z" />
              <path fill="#F54F33" d="M423.7,849.756h9.701v-4.85H423.7V849.756z" />
            </g>
            <g>
              <path fill="#D8CDC8" d="M280.357,734.261c-2.433,0.077-4.74,1.097-6.434,2.846L195.635,815.7 c-3.705,3.611-3.781,9.541-0.171,13.246c3.611,3.705,9.541,3.781,13.246,0.171c0.067-0.065,0.132-0.131,0.197-0.197l78.289-78.594 c3.702-3.614,3.773-9.544,0.159-13.246C285.52,735.201,282.981,734.178,280.357,734.261z" />
              <path fill="#D8CDC8" d="M208.898,746.427c-7.951,0.001-14.312,6.246-14.312,14.051c0,7.804,6.363,14.047,14.314,14.047 c7.422,0,13.783-6.245,13.783-14.049l0,0c0-7.805-6.362-14.049-13.783-14.049H208.898z" />
              <path fill="#D8CDC8" d="M108.883,773.647c-5.172-0.095-9.442,4.022-9.537,9.194s4.022,9.442,9.194,9.537 c0.114,0.002,0.229,0.002,0.343,0h41.754c5.172,0.095,9.442-4.022,9.537-9.194s-4.022-9.442-9.194-9.537 c-0.114-0.002-0.229-0.002-0.343,0H108.883z" />
              <path fill="#D8CDC8" d="M341.298,773.647c-5.172-0.095-9.442,4.022-9.537,9.194s4.022,9.442,9.194,9.537 c0.114,0.002,0.229,0.002,0.343,0h41.756c5.172,0.095,9.442-4.022,9.537-9.194s-4.022-9.442-9.194-9.537 c-0.114-0.002-0.229-0.002-0.343,0H341.298z" />
              <path fill="#D8CDC8" d="M274.459,791.499c-7.951,0.001-14.312,6.246-14.312,14.051c0,7.804,6.363,14.047,14.314,14.047 c7.422,0,13.783-6.243,13.783-14.047v-0.002c0-7.805-6.362-14.049-13.783-14.049L274.459,791.499z" />
            </g>
            <g>
              <path fill="#616161" d="M221.269,757.825c0,7.804-6.361,14.048-13.784,14.048c-7.952,0-14.314-6.244-14.314-14.048 c0-7.805,6.361-14.049,14.313-14.05c7.422,0,13.784,6.244,13.784,14.049L221.269,757.825z" />
              <path fill="#616161" d="M286.83,802.898c0,7.804-6.361,14.048-13.784,14.048c-7.952,0-14.314-6.244-14.314-14.048 c0-7.805,6.361-14.049,14.313-14.05c7.422,0,13.784,6.244,13.784,14.049L286.83,802.898z" />
            </g>
            <path
              fill="#ECDFDA"
              d="M37.414,680.847C35.49,701.734,19.54,717.919,0,718.81v123.076 c19.559,0.877,35.53,17.078,37.445,37.986h405.142c1.923-20.886,17.873-37.07,37.412-37.963V718.836 c-19.559-0.878-35.529-17.08-37.443-37.988H37.414L37.414,680.847z M42.785,683.486h394.4c1.864,20.354,17.411,36.126,36.451,36.98 v119.812c-19.02,0.869-34.547,16.624-36.42,36.955h-394.4c-1.864-20.354-17.411-36.126-36.451-36.98v-119.81 C25.386,719.574,40.913,703.818,42.785,683.486z"
            />
            <g>
              <path fill="#D8CDC8" d="M79.015,680.848L0.001,753.784v38.48l117.605-111.416H79.015z" />
              <path fill="#F54F33" d="M0.001,751.092l76.097-70.244h35.122L0.001,786.214L0.001,751.092z" />
            </g>
            <g shapeRendering="auto" imageRendering="auto" colorRendering="auto" colorInterpolation="sRGB">
              <g>
                <path fill="#616161" d="M339.884,770.995c-5.172-0.095-9.442,4.022-9.537,9.194s4.022,9.442,9.194,9.537 c0.114,0.002,0.229,0.002,0.343,0h41.756c5.172,0.095,9.442-4.022,9.537-9.194s-4.022-9.442-9.194-9.537 c-0.114-0.002-0.229-0.002-0.343,0H339.884z" />
                <path fill="#616161" d="M278.943,731.608c-2.433,0.077-4.74,1.097-6.434,2.846l-78.289,78.594 c-3.705,3.61-3.782,9.541-0.171,13.245c3.61,3.705,9.541,3.782,13.245,0.171c0.067-0.065,0.132-0.131,0.197-0.198l78.289-78.594 c3.702-3.614,3.773-9.544,0.159-13.246C284.105,732.548,281.567,731.526,278.943,731.608L278.943,731.608z" />
                <path fill="#616161" d="M107.468,770.995c-5.172-0.095-9.442,4.022-9.537,9.194s4.022,9.442,9.194,9.537 c0.114,0.002,0.229,0.002,0.343,0h41.754c5.172,0.095,9.442-4.022,9.537-9.194s-4.022-9.442-9.194-9.537 c-0.114-0.002-0.229-0.002-0.343,0H107.468z" />
              </g>
              <path fill="#F54F33" d="M43.118,844.904v4.852h9.703v-4.852H43.118z" />
            </g>
          </g>
        </svg>
      </g>

      {/* SVG 1: Reward Badge, Ribbons & Coins Token (Foreground) */}
      <g
        className={styles.rewardBadgeBob}
        filter="drop-shadow(0 8px 18px rgba(69, 143, 222, 0.25)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))"
      >
        <svg x="16" y="22" width="96" height="96" viewBox="0 0 512 512">
          {/* Blue Ribbons */}
          <path fill="#458FDE" d="M367.653,191.039c0-39.509-32.142-71.652-71.652-71.652h-8.492c-4.397,0-7.961,3.563-7.961,7.961 v259.94l88.105,53.493V191.039z" />
          <path fill="#89DCFC" d="M296.063,387.289v-259.94c0-3.696,2.521-6.794,5.935-7.692c-1.98-0.165-3.976-0.27-5.999-0.27h-8.492 c-4.397,0-7.961,3.563-7.961,7.961v259.94l88.105,53.493v-10.028L296.063,387.289z" />
          <path fill="#4F5AA8" d="M367.653,401.193c-14.216-22.904-39.585-38.196-68.467-38.196c-6.772,0-13.35,0.85-19.638,2.432 v21.858l88.105,53.493V401.193z" />
          {/* Gold Coins */}
          <path fill="#FFD652" d="M299.185,375.066c-37.753,0-68.467,30.715-68.467,68.467S261.433,512,299.185,512 s68.467-30.715,68.467-68.467S336.938,375.066,299.185,375.066z M274.771,443.533c0-13.484,10.93-24.415,24.415-24.415 c13.484,0,24.415,10.93,24.415,24.415c0,13.484-10.93,24.415-24.415,24.415C285.702,467.947,274.771,457.017,274.771,443.533z" />
          <path fill="#FCB16B" d="M321.687,489.497c-37.753,0-68.467-30.715-68.467-68.467c0-13.123,3.718-25.391,10.146-35.818 c-19.571,12.064-32.649,33.691-32.649,58.321c0,37.753,30.715,68.467,68.467,68.467c24.63,0,46.257-13.078,58.321-32.649 C347.078,485.78,334.811,489.497,321.687,489.497z" />
          <path fill="#458FDE" d="M190.453,368.129c-39.509,0-71.652-32.142-71.652-71.652v-8.492c0-4.397,3.563-7.961,7.961-7.961 h259.94l53.493,88.105H190.453z" />
          <path fill="#89DCFC" d="M386.702,296.539h-259.94c-3.696,0-6.794,2.521-7.692,5.935c-0.165-1.98-0.27-3.976-0.27-5.999 v-8.492c0-4.397,3.563-7.961,7.961-7.961h259.94l53.493,88.105h-10.028L386.702,296.539z" />
          <path fill="#4F5AA8" d="M400.608,368.129c-22.904-14.216-38.196-39.585-38.196-68.467c0-6.772,0.85-13.35,2.432-19.638 h21.857l53.493,88.105H400.608z" />
          <path fill="#FFD652" d="M442.946,368.129c37.753,0,68.467-30.715,68.467-68.467s-30.715-68.467-68.467-68.467 s-68.467,30.715-68.467,68.467S405.194,368.129,442.946,368.129z M467.361,299.661c0,13.484-10.93,24.415-24.415,24.415 c-13.484,0-24.415-10.93-24.415-24.415c0-13.484,10.93-24.415,24.415-24.415C456.431,275.247,467.361,286.178,467.361,299.661z" />
          <path fill="#FCB16B" d="M488.912,322.164c0-37.753-30.715-68.467-68.467-68.467c-13.123,0-25.391,3.718-35.818,10.146 c12.064-19.571,33.691-32.649,58.321-32.649c37.753,0,68.467,30.715,68.467,68.467c0,24.63-13.078,46.257-32.649,58.321 C485.193,347.554,488.912,335.288,488.912,322.164z" />
          <circle fill="#FFD652" cx="322.963" cy="323.569" r="14.861" />
          {/* Stamp Badge Body */}
          <path fill="#E5E5E5" d="M40.391,7.961h188.948c17.588,0,31.845,14.257,31.845,31.845v193.194 c0,17.588-14.257,31.845-31.845,31.845H40.391c-17.588,0-31.845-14.257-31.845-31.845V39.807 C8.546,22.218,22.804,7.961,40.391,7.961z" />
          {/* Dashed Edge Stitches */}
          <path fill="#4C4C4C" d="M197.263,272.807h-32.145c-4.397,0-7.961-3.563-7.961-7.961c0-4.398,3.565-7.961,7.961-7.961h32.145 c4.397,0,7.961,3.563,7.961,7.961C205.224,269.244,201.659,272.807,197.263,272.807z M132.974,272.807H100.83 c-4.397,0-7.961-3.563-7.961-7.961c0-4.398,3.565-7.961,7.961-7.961h32.145c4.397,0,7.961,3.563,7.961,7.961 C140.936,269.244,137.371,272.807,132.974,272.807z M68.686,272.807H40.392c-1.6,0-3.211-0.097-4.79-0.287 c-4.365-0.524-7.478-4.489-6.954-8.855c0.524-4.366,4.489-7.487,8.855-6.954c0.95,0.114,1.922,0.172,2.888,0.172h28.294 c4.397,0,7.961,3.563,7.961,7.961C76.648,269.243,73.083,272.807,68.686,272.807z M229.406,272.806 c-4.389,0-7.952-3.554-7.961-7.945c-0.008-4.397,3.549-7.968,7.945-7.977c8.251-0.017,15.802-4.207,20.196-11.208 c2.337-3.723,7.252-4.847,10.976-2.508c3.724,2.337,4.847,7.251,2.509,10.975c-7.32,11.66-19.899,18.637-33.65,18.664 C229.418,272.806,229.411,272.806,229.406,272.806z M11.592,254.562c-2.983,0-5.843-1.685-7.202-4.56 c-2.524-5.338-3.804-11.059-3.804-17.001v-18.093c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v18.093 c0,3.57,0.766,7,2.277,10.195c1.88,3.975,0.18,8.721-3.794,10.6C13.89,254.315,12.732,254.562,11.592,254.562z M261.185,226.648 c-4.397,0-7.961-3.563-7.961-7.961v-32.144c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v32.144 C269.147,223.083,265.582,226.648,261.185,226.648z M8.547,190.725c-4.397,0-7.961-3.563-7.961-7.961V150.62 c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v32.144C16.508,187.161,12.944,190.725,8.547,190.725z M261.185,162.36 c-4.397,0-7.961-3.563-7.961-7.961v-32.144c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v32.144 C269.147,158.796,265.582,162.36,261.185,162.36z M8.547,126.436c-4.397,0-7.961-3.563-7.961-7.961V86.331 c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v32.144C16.508,122.873,12.944,126.436,8.547,126.436z M261.185,98.072 c-4.397,0-7.961-3.563-7.961-7.961V57.966c0-4.398,3.565-7.961,7.961-7.961s7.961,3.563,7.961,7.961v32.143 C269.147,94.507,265.582,98.072,261.185,98.072z M8.547,62.149c-4.397,0-7.961-3.563-7.961-7.961V39.807 c0-7.473,2.085-14.759,6.029-21.072c2.33-3.729,7.241-4.863,10.971-2.533c3.729,2.33,4.863,7.242,2.533,10.971 c-2.362,3.78-3.61,8.148-3.61,12.633v14.381C16.508,58.585,12.944,62.149,8.547,62.149z M258.178,34.234 c-2.989,0-5.853-1.691-7.21-4.576c-3.469-7.376-10.631-12.572-18.689-13.557c-4.365-0.533-7.471-4.504-6.937-8.868 c0.533-4.363,4.504-7.472,8.868-6.936c13.649,1.668,25.3,10.111,31.167,22.586c1.871,3.979,0.162,8.721-3.816,10.593 C260.467,33.991,259.313,34.234,258.178,34.234z M201.112,15.923h-32.145c-4.397,0-7.961-3.563-7.961-7.961S164.57,0,168.967,0 h32.145c4.397,0,7.961,3.563,7.961,7.961S205.508,15.923,201.112,15.923z M136.824,15.923H104.68c-4.397,0-7.961-3.563-7.961-7.961 S100.283,0,104.68,0h32.145c4.397,0,7.961,3.563,7.961,7.961S141.22,15.923,136.824,15.923z M72.535,15.923H40.258 c-4.397,0-7.961-3.563-7.961-7.961S35.861,0,40.258,0h32.278c4.397,0,7.961,3.563,7.961,7.961S76.932,15.923,72.535,15.923z" />
          {/* Inner Badge & Discount % */}
          <circle fill="#B2B2B2" cx="134.864" cy="136.404" r="112.169" />
          <path fill="#AFF078" d="M134.866,32.907c-57.069,0-103.497,46.428-103.497,103.497s46.428,103.497,103.497,103.497 s103.497-46.428,103.497-103.497S191.934,32.907,134.866,32.907z" />
          <path fill="#5AC779" d="M155.849,218.917c-57.069,0-103.497-46.428-103.497-103.497c0-23.194,7.669-44.631,20.606-61.907 c-25.231,18.893-41.59,49.017-41.59,82.891c0,57.069,46.428,103.497,103.497,103.497c33.874,0,63.999-16.358,82.891-41.59 C200.48,211.247,179.044,218.917,155.849,218.917z" />
          <g>
            <path fill="#00A085" d="M103.021,129.504c-13.755,0-24.945-11.19-24.945-24.945s11.19-24.945,24.945-24.945 s24.945,11.19,24.945,24.945S116.776,129.504,103.021,129.504z M103.021,95.536c-4.975,0-9.023,4.048-9.023,9.023 s4.048,9.023,9.023,9.023s9.023-4.048,9.023-9.023S107.996,95.536,103.021,95.536z" />
            <path fill="#00A085" d="M166.711,193.194c-13.755,0-24.945-11.19-24.945-24.945s11.19-24.945,24.945-24.945 s24.945,11.19,24.945,24.945S180.466,193.194,166.711,193.194z M166.711,159.226c-4.975,0-9.023,4.048-9.023,9.023 s4.048,9.023,9.023,9.023s9.023-4.048,9.023-9.023S171.687,159.226,166.711,159.226z" />
            <path fill="#00A085" d="M90.283,188.948c-2.037,0-4.075-0.777-5.629-2.331c-3.109-3.11-3.109-8.15,0-11.259l93.413-93.413 c3.109-3.108,8.15-3.108,11.258,0c3.109,3.11,3.109,8.15,0,11.259l-93.413,93.413C94.357,188.171,92.32,188.948,90.283,188.948z" />
          </g>
        </svg>
      </g>
    </svg>
  );
}

/* ── Colorful SVG 4: 100% Real Customer Results (Pure Vector, No Text) ── */
function ResultsColorfulGraphic() {
  return (
    <svg
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svgGraphic}
      aria-label="Verified customer results analytics animation"
    >
      <defs>
        {/* Sleek 3D Gradients for Histogram Bars */}
        <linearGradient id="barCoralGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="barAmberGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="barCyanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <linearGradient id="barEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="barIndigoGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>

        {/* Spline Line & Area Glow Gradients */}
        <linearGradient id="splineLineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(16, 185, 129, 0.25)" />
          <stop offset="60%" stopColor="rgba(56, 189, 248, 0.08)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
        </linearGradient>

        {/* Dashboard Console Background Surface Gradient */}
        <linearGradient id="consoleSurfaceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>

      {/* Ground Contact Floor Shadow */}
      <ellipse cx="120" cy="126" rx="66" ry="6" fill="#0f172a" opacity="0.09" />

      {/* Floating Analytics Dashboard Console */}
      <g className={styles.analyticsConsoleBob}>
        {/* Main Dashboard Card Surface */}
        <rect
          x="44"
          y="15"
          width="152"
          height="106"
          rx="16"
          fill="url(#consoleSurfaceGrad)"
          stroke="#10b981"
          strokeWidth="1.5"
          filter="drop-shadow(0 8px 24px rgba(16, 185, 129, 0.16)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.04))"
        />

        {/* Console Top Window Header Bar */}
        {/* Window Controls (macOS style clean luxury dots) */}
        <circle cx="58" cy="28" r="2.8" fill="#f87171" />
        <circle cx="66.5" cy="28" r="2.8" fill="#fbbf24" />
        <circle cx="75" cy="28" r="2.8" fill="#34d399" />

        {/* Live Pulse Telemetry Monitor Capsule */}
        <rect
          x="104"
          y="22"
          width="82"
          height="12"
          rx="6"
          fill="#f0fdf4"
          stroke="#86efac"
          strokeWidth="0.8"
        />
        {/* Live Green Pulsing Dot */}
        <circle cx="112" cy="28" r="2.2" fill="#10b981" />
        <circle cx="112" cy="28" r="4.2" fill="none" stroke="#10b981" strokeWidth="0.8" opacity="0.5" className={styles.telemetryPulse} />
        {/* Real-time Telemetry Waveform */}
        <path
          d="M 120,28 L 126,28 L 129,24 L 133,32 L 137,25 L 140,29 L 144,28 L 180,28"
          fill="none"
          stroke="#059669"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Horizontal Header Divider Line */}
        <line x1="44" y1="37" x2="196" y2="37" stroke="#e2e8f0" strokeWidth="0.8" />

        {/* Subtle Chart Grid Guidelines */}
        <line x1="56" y1="57" x2="184" y2="57" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="56" y1="77" x2="184" y2="77" stroke="#f1f5f9" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="56" y1="98" x2="184" y2="98" stroke="#e2e8f0" strokeWidth="1" />

        {/* Spline Area Under Curve (Translucent Gradient Fill) */}
        <path
          d="M 68,82 Q 88,72 108,60 T 136,46 T 168,54 L 168,98 L 68,98 Z"
          fill="url(#splineAreaGrad)"
        />

        {/* Vibrant 3D Histogram Columns with Specular Caps */}
        <g>
          {/* Bar 1: Coral */}
          <rect x="64" y="74" width="12" height="24" rx="4" fill="url(#barCoralGrad)" className={styles.chartBar1} />
          <rect x="64" y="74" width="12" height="3" rx="1.5" fill="#fecdd3" opacity="0.8" />

          {/* Bar 2: Amber */}
          <rect x="84" y="62" width="12" height="36" rx="4" fill="url(#barAmberGrad)" className={styles.chartBar2} />
          <rect x="84" y="62" width="12" height="3" rx="1.5" fill="#fef08a" opacity="0.8" />

          {/* Bar 3: Cyan */}
          <rect x="104" y="52" width="12" height="46" rx="4" fill="url(#barCyanGrad)" className={styles.chartBar3} />
          <rect x="104" y="52" width="12" height="3" rx="1.5" fill="#bae6fd" opacity="0.8" />

          {/* Bar 4: Emerald (Highest Peak) */}
          <rect x="124" y="42" width="12" height="56" rx="4" fill="url(#barEmeraldGrad)" className={styles.chartBar4} />
          <rect x="124" y="42" width="12" height="3" rx="1.5" fill="#d1fae5" opacity="0.9" />

          {/* Bar 5: Indigo */}
          <rect x="144" y="56" width="12" height="42" rx="4" fill="url(#barIndigoGrad)" className={styles.chartBar5} />
          <rect x="144" y="56" width="12" height="3" rx="1.5" fill="#ddd6fe" opacity="0.8" />

          {/* Bar 6: Emerald Accent */}
          <rect x="164" y="66" width="12" height="32" rx="4" fill="url(#barEmeraldGrad)" className={styles.chartBar6} />
          <rect x="164" y="66" width="12" height="3" rx="1.5" fill="#a7f3d0" opacity="0.8" />
        </g>

        {/* Glowing Continuous Growth Spline Line */}
        <path
          d="M 62,86 C 80,78 94,66 110,60 C 122,54 126,44 130,44 C 138,44 146,58 158,58 C 166,58 174,68 180,68"
          fill="none"
          stroke="url(#splineLineGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          filter="drop-shadow(0 2px 6px rgba(16, 185, 129, 0.4))"
        />

        {/* Peak Luminous Metric Beacon Ring at Peak (x=130, y=44) */}
        <g className={styles.peakRingPulse}>
          <circle cx="130" cy="44" r="6.5" fill="none" stroke="#10b981" strokeWidth="1.2" opacity="0.6" />
          <circle cx="130" cy="44" r="3.5" fill="#ffffff" stroke="#059669" strokeWidth="2" />
        </g>

        {/* Floating Mini KPI Metric Card (Pure Vector, Zero Text) */}
        <g transform="translate(142, 82)" filter="drop-shadow(0 4px 10px rgba(15, 23, 42, 0.18))">
          <rect x="0" y="0" width="48" height="20" rx="6" fill="#0f172a" />
          {/* Radial Donut Progress Dial */}
          <circle cx="10" cy="10" r="4.5" fill="none" stroke="#334155" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="4.5" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="21 7" />
          <circle cx="10" cy="10" r="1.5" fill="#10b981" />
          {/* Rising Micro Sparkline */}
          <path d="M 20,12 L 25,9 L 30,11 L 40,6" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="40" cy="6" r="1.5" fill="#38bdf8" />
        </g>
      </g>
    </svg>
  );
}

const PHYGITAL_STEPS = [
  {
    tag: "01 · TOUCHPOINT",
    status: "IN HAND",
    title: "Physical Dwell",
    subtitle: "Dining • Hospitality • Co-Working",
    features: [
      "30+ mins physical table dwell",
      "Held in real hands at partner venues",
      "Zero ad-blockers or skipped feeds",
    ],
    pillarLabel: "Physical Presence",
    pillarVal: "30+ Mins",
    bgClass: styles.canvasBg1,
    graphic: <TouchpointColorfulGraphic />,
  },
  {
    tag: "02 · CONNECTION",
    status: "INSTANT SCAN",
    title: "Frictionless Scan",
    subtitle: "Native Camera • iOS & Android",
    features: [
      "Native iPhone & Android camera scan",
      "Zero app download or store friction",
      "Instant browser load in <1 sec",
    ],
    pillarLabel: "Interactive Speed",
    pillarVal: "<1 Sec",
    bgClass: styles.canvasBg2,
    graphic: <ScanColorfulGraphic />,
  },
  {
    tag: "03 · IMMERSION",
    status: "REWARDS & AR",
    title: "Games & Rewards",
    subtitle: "Coupons • Quizzes • 3D WebAR",
    features: [
      "Instant scratch coupons & discounts",
      "Interactive trivia challenges",
      "Engaging 3D camera WebAR",
    ],
    pillarLabel: "User Incentive",
    pillarVal: "Instant Perks",
    bgClass: styles.canvasBg3,
    graphic: <RewardsColorfulGraphic />,
  },
  {
    tag: "04 · RESULTS",
    status: "VERIFIED SCAN",
    title: "Real Customer Data",
    subtitle: "Attribution • Venue Analytics",
    features: [
      "100% verified real human scans",
      "Zero bot fraud or fake clicks",
      "Direct first-party brand leads",
    ],
    pillarLabel: "Data Standard",
    pillarVal: "100% Real",
    bgClass: styles.canvasBg4,
    graphic: <ResultsColorfulGraphic />,
  },
];

export default function WhatWeDoSection() {
  const { openModal } = useNav();

  return (
    <div className={styles.section} aria-label="What We Do">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Turn What People Hold
            <br />
            <span className={styles.titleHighlight}>Into Something They Can Experience.</span>
          </h2>
          <p className={styles.subtitle}>
            We convert physical packaged goods into interactive digital portals. One seamless loop from real-world touchpoint to measurable engagement.
          </p>
        </div>

        {/* 4 Clean, Friendly Luxury Cards with Colorful SVGs */}
        <div className={styles.grid}>
          {PHYGITAL_STEPS.map((item) => (
            <div key={item.tag} className={styles.card}>
              {/* Header: Tag + Status Badge */}
              <div className={styles.cardTop}>
                <span className={styles.stepTag}>{item.tag}</span>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot} />
                  <span>{item.status}</span>
                </div>
              </div>

              {/* Colorful Animated SVG Canvas */}
              <div className={`${styles.svgCanvas} ${item.bgClass}`}>
                {item.graphic}
              </div>

              {/* Title, Subtitle & Crisp Feature Points */}
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <span className={styles.cardSub}>{item.subtitle}</span>

                {/* Feature Checklist with Green Tick Marks */}
                <div className={styles.featureList}>
                  {item.features.map((feat, idx) => (
                    <div key={idx} className={styles.featureItem}>
                      <span className={styles.featureCheck}>
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      <span className={styles.featureText}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Highlight Pillar */}
              <div className={styles.cardPillar}>
                <span className={styles.pillarLabel}>{item.pillarLabel}</span>
                <span className={styles.pillarVal}>{item.pillarVal}</span>
              </div>
            </div>
          ))}
        </div>

        {/* High-Impact Bottom CTA Banner (Matching Why Kulture Reference) */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaContent}>
            <h3 className={styles.ctaHeading}>
              Turn Everyday Physical Bottles
              <br />
              <span className={styles.ctaHeadingHighlight}>
                Into Your Most Profitable Media Channel.
              </span>
            </h3>
            <p className={styles.ctaSubtext}>
              Reach real customers across premium cafes, hotels, and events. Zero app installs, 30+ minutes of focused attention, and guaranteed direct customer leads.
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
          </div>
        </div>
      </div>
    </div>
  );
}
