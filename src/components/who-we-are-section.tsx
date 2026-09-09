"use client";

import KeycapButton from "@/components/keycap-button";
import { useNav } from "@/components/nav-provider";
import styles from "./who-we-are-section.module.css";

const PHILOSOPHY_PILLARS = [
  {
    num: "01",
    title: "Physical-First Empathy",
    desc: "Human attention cannot be coerced through popups. We earn real dwell time through high-quality physical objects that bring real utility, refreshment, and tactile beauty.",
  },
  {
    num: "02",
    title: "Zero-Friction Technology",
    desc: "We engineer native WebAR engines that load in under 500ms without app downloads, accounts, or friction—delivering instant gratification to the user.",
  },
  {
    num: "03",
    title: "Circular & Sustainable",
    desc: "Every bottle is 100% recyclable, ethically sourced from certified springs, and designed to minimize footprint while maximizing shared value.",
  },
];

export default function WhoWeAreSection() {
  const { openModal } = useNav();

  return (
    <div className={styles.section} aria-label="Who We Are">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Reclaiming Real Attention
            <br />
            <span className={styles.titleHighlight}>In an Algorithmic World.</span>
          </h2>
          <p className={styles.subtitle}>
            Born from a conviction that digital ads are losing their soul to bots and ad-blockers.
            The future of media belongs to the physical world we inhabit.
          </p>
        </div>

        {/* Story / Heritage Card */}
        <div className={styles.heritageCard}>
          <div className={styles.heritageGlow} />

          <div className={styles.heritageLeft}>
            <span className={styles.ethosBadge}>THE KULTURE ETHOS</span>
            <h3 className={styles.heritageTitle}>
              Rooted in the Konark Spirit of Perpetual Motion.
            </h3>
            <p className={styles.heritageBody}>
              Inspired by the eternal craftsmanship of the Konark Sun Wheel,
              Kulture represents the relentless cyclical momentum of progress. We
              bridge the timeless tangibility of physical products with the speed of
              digital technology.
            </p>
            <p className={styles.heritageBody}>
              We are not another ad network. We are an attention ecosystem built
              on generosity—where venues save money, brands gain real humans,
              and consumers are genuinely rewarded.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className={styles.pillarsList}>
            {PHILOSOPHY_PILLARS.map((p) => (
              <div key={p.num} className={styles.pillarItem}>
                <div className={styles.pillarHead}>
                  <span className={styles.pillarNum}>{p.num}</span>
                  <h4 className={styles.pillarTitle}>{p.title}</h4>
                </div>
                <p className={styles.pillarDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Master CTA Conversion Banner */}
        <div className={styles.masterCta}>
          <div className={styles.masterCtaLeft}>
            <h3 className={styles.masterCtaTitle}>
              Ready to claim your place in the{" "}
              <span className={styles.masterCtaHighlight}>physical attention ecosystem?</span>
            </h3>
            <p className={styles.masterCtaDesc}>
              Whether you are a brand seeking genuine human engagement or a venue
              looking to eliminate hydration costs, Kulture is built for you.
            </p>
          </div>

          <div className={styles.masterCtaActions}>
            <KeycapButton onClick={() => openModal("partner")}>
              Partner With Us →
            </KeycapButton>
            <button
              type="button"
              className={styles.expansionBtn}
              onClick={() => openModal("investor")}
            >
              Fuel our expansion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
