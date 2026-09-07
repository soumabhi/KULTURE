import styles from "./animated-bottle.module.css";

export default function AnimatedBottle() {
  return (
    <svg
      className={styles.inlineBottle}
      viewBox="0 0 42 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Water bottle"
      role="img"
    >
      <defs>
        {/* Clip path of the bottle interior strictly stopping at the shoulder below the neck */}
        <clipPath id="kultur-bottle-interior">
          <path d="M 14,26 C 14,24 16,22 18,22 L 24,22 C 26,22 28,24 28,26 L 35,29 C 37,30 38,32 38,34.5 L 38,89 C 38,92.5 35.5,95 32,95 L 10,95 C 6.5,95 4,92.5 4,89 L 4,34.5 C 4,32 5,30 7,29 Z" />
        </clipPath>

        {/* Water liquid gradient */}
        <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="35%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#0077b6" />
        </linearGradient>

        {/* Metallic cap / neck thread gradient */}
        <linearGradient id="metal-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#64748b" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="75%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        {/* Glass reflection highlight */}
        <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Translucent bottle back & fill container */}
      <path
        d="M 14,22 C 14,17.5 16,16 16,16 L 26,16 C 26,16 28,17.5 28,22 L 35.5,26.5 C 37.5,27.8 38.5,30 38.5,32.5 L 38.5,89.5 C 38.5,93 35.5,95.5 32,95.5 L 10,95.5 C 6.5,95.5 3.5,93 3.5,89.5 L 3.5,32.5 C 3.5,30 4.5,27.8 6.5,26.5 Z"
        fill="rgba(240, 248, 255, 0.55)"
        stroke="#94a3b8"
        strokeWidth="1.2"
      />

      {/* 2. Animated rising water group (clipped strictly below neck) */}
      <g clipPath="url(#kultur-bottle-interior)">
        <g className={styles.waterFill}>
          {/* Wave top surface */}
          <path
            className={styles.waveSurface}
            d="M -4,22 Q 8,18 21,22 T 46,22 L 46,98 L -4,98 Z"
            fill="url(#water-grad)"
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

      {/* 3. Glass specular glare / shine on left edge */}
      <path
        d="M 7,32 C 7,30 7.8,28.5 9,28 L 9,90 C 7.8,89.5 7,88 7,86 Z"
        fill="url(#glass-shine)"
      />

      {/* 4. Glass outline border */}
      <path
        d="M 14,22 C 14,17.5 16,16 16,16 L 26,16 C 26,16 28,17.5 28,22 L 35.5,26.5 C 37.5,27.8 38.5,30 38.5,32.5 L 38.5,89.5 C 38.5,93 35.5,95.5 32,95.5 L 10,95.5 C 6.5,95.5 3.5,93 3.5,89.5 L 3.5,32.5 C 3.5,30 4.5,27.8 6.5,26.5 Z"
        fill="none"
        stroke="#64748b"
        strokeWidth="1.3"
      />

      {/* 5. Metallic neck & thread ring collar */}
      {/* Neck base ring */}
      <rect
        x="13"
        y="15"
        width="16"
        height="3"
        rx="1"
        fill="url(#metal-grad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* Neck cylinder */}
      <rect
        x="15"
        y="6"
        width="12"
        height="10"
        fill="url(#metal-grad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* Thread 1 */}
      <rect
        x="14"
        y="7"
        width="14"
        height="2.2"
        rx="0.8"
        fill="url(#metal-grad)"
        stroke="#334155"
        strokeWidth="0.6"
      />
      {/* Thread 2 / Lip */}
      <rect
        x="14"
        y="11"
        width="14"
        height="2.2"
        rx="0.8"
        fill="url(#metal-grad)"
        stroke="#334155"
        strokeWidth="0.6"
      />
    </svg>
  );
}
