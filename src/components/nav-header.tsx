"use client";

import KeycapButton from "@/components/keycap-button";
import { useNav } from "@/components/nav-provider";
import styles from "./nav-header.module.css";

export default function NavHeader() {
  const { isMenuOpen, openMenu, openModal } = useNav();

  return (
    <nav className={styles.headerActions} aria-label="Site Header Navigation">
      {/* Desktop navbar: includes Fuel our expansion, Partner With Us, and the ↗ menu button */}
      <div className={styles.desktopActions}>
        <button
          type="button"
          onClick={() => openModal("investor")}
          className={styles.expansionLink}
        >
          Fuel our expansion
        </button>
        <KeycapButton
          type="button"
          onClick={() => openModal("partner")}
        >
          Partner With Us
        </KeycapButton>
        <KeycapButton
          type="button"
          className={styles.iconKeycap}
          onClick={openMenu}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.iconSymbol}>↗</span>
        </KeycapButton>
      </div>

      {/* Mobile keycap icon trigger (visible on mobile <=768px) */}
      <div className={styles.mobileTrigger}>
        <KeycapButton
          type="button"
          className={styles.iconKeycap}
          onClick={openMenu}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.iconSymbol}>↗</span>
        </KeycapButton>
      </div>
    </nav>
  );
}
