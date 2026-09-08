"use client";

import { useState } from "react";
import ContactModal, { ModalMode } from "@/components/contact-modal";
import KeycapButton from "@/components/keycap-button";
import SlidingMenu from "@/components/sliding-menu";
import styles from "./nav-header.module.css";

export default function NavHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalMode | null>(null);

  return (
    <>
      <nav className={styles.headerActions} aria-label="Site Header Navigation">
        {/* Desktop navbar: includes Fuel our expansion, Partner With Us, and the ↗ menu button */}
        <div className={styles.desktopActions}>
          <button
            type="button"
            onClick={() => setActiveModal("investor")}
            className={styles.expansionLink}
          >
            Fuel our expansion
          </button>
          <KeycapButton
            type="button"
            onClick={() => setActiveModal("partner")}
          >
            Partner With Us
          </KeycapButton>
          <KeycapButton
            type="button"
            className={styles.iconKeycap}
            onClick={() => setIsMenuOpen(true)}
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
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.iconSymbol}>↗</span>
          </KeycapButton>
        </div>
      </nav>

      {/* GSAP Multi-Panel Sliding Menu Overlay */}
      <SlidingMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenPartnerModal={() => {
          setIsMenuOpen(false);
          setActiveModal("partner");
        }}
      />

      {/* Unified Investor & Partner Modal */}
      <ContactModal
        mode={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
