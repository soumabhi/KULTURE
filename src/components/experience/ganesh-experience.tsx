"use client";

import Image from "next/image";
import { KeycapLink } from "@/components/keycap-button";
import styles from "./ganesh-experience.module.css";

type GaneshExperienceProps = {
  batchCode: string;
  scanSessionId: string | null;
  title: string;
  subtitle: string | null;
  sponsorName: string | null;
  gameType: string | null;
};

export default function GaneshExperience({
  batchCode,
  scanSessionId,
  title,
  subtitle,
  sponsorName,
  gameType,
}: GaneshExperienceProps) {
  const playHref = scanSessionId
    ? `/scan/${encodeURIComponent(batchCode)}/play?s=${encodeURIComponent(scanSessionId)}`
    : null;

  return (
    <main className={styles.stage}>
      <Image
        src="/konarkc.png"
        alt=""
        width={1261}
        height={1247}
        priority
        draggable={false}
        className={styles.chakra}
      />
      <Image
        src="/kwat.png"
        alt=""
        width={2172}
        height={724}
        priority
        draggable={false}
        className={styles.water}
      />

      <section className={styles.card}>
        <p className={styles.eyebrow}>KULTUR · Ganesh Puja</p>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}

        {sponsorName ? (
          <p className={styles.sponsor}>
            <span>Sponsored by</span>
            <strong>{sponsorName}</strong>
          </p>
        ) : null}

        <div className={styles.actions}>
          {playHref ? (
            <KeycapLink href={playHref}>
              Play {gameType === "CATCH_MODAK" ? "Catch the Modak" : "the game"}
            </KeycapLink>
          ) : (
            <p className={styles.note}>
              This batch is not accepting game sessions right now.
            </p>
          )}
          <KeycapLink
            href={`/scan/${encodeURIComponent(batchCode)}/claim`}
            className={styles.secondary}
          >
            Claim your offer
          </KeycapLink>
        </div>

        <p className={styles.meta}>
          Batch <code>{batchCode}</code>
        </p>
      </section>
    </main>
  );
}
