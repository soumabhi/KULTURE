"use client";

import { useEffect, useState } from "react";
import ContactModal, { ModalMode } from "@/components/contact-modal";
import KeycapButton from "@/components/keycap-button";
import styles from "./nav-header.module.css";

export default function NavHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalMode | null>(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveModal(null);
      }
    };
    if (isOpen || activeModal) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, activeModal]);

  return (
    <>
      <nav className={styles.headerActions} aria-label="Site Header Navigation">
        {/* Desktop navbar (hidden on mobile <=768px) */}
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
        </div>

        {/* Mobile keycap icon trigger (visible ONLY on mobile <=768px) */}
        <div className={styles.mobileTrigger}>
          <KeycapButton
            type="button"
            className={styles.iconKeycap}
            onClick={() => setIsOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
          >
            <span className={styles.iconSymbol}>↗</span>
          </KeycapButton>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.drawerOverlay} ${isOpen ? styles.isOpen : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`${styles.drawer} ${isOpen ? styles.isOpen : ""}`}
        aria-label="Mobile Navigation"
        aria-hidden={!isOpen}
      >
        <div className={styles.drawerHeader}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerNavList}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setActiveModal("partner");
            }}
            className={styles.drawerNavLink}
          >
            Partner With Us
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setActiveModal("investor");
            }}
            className={styles.drawerNavLink}
          >
            Fuel our expansion
          </button>
        </div>
      </aside>

      {/* Unified Investor & Partner Modal */}
      <ContactModal
        mode={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
