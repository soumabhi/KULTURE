"use client";

import { useEffect, useState } from "react";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./expansion-modal.module.css";

type ExpansionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EMAIL = "abhishekhansdak53@gmail.com";

export default function ExpansionModal({ isOpen, onClose }: ExpansionModalProps) {
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    triggerHaptic("success");
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for browsers without clipboard permissions
      const textarea = document.createElement("textarea");
      textarea.value = EMAIL;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="expansion-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="expansion-modal-title" className={styles.title}>
            Fuel our expansion
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <p className={styles.description}>
          Join us in scaling India&apos;s first cultural heritage physical-to-digital
          beverage network. Get in touch to discuss investment, franchise opportunities,
          or distribution partnerships.
        </p>

        <div className={styles.emailBox}>
          <div className={styles.emailLeft}>
            <span className={styles.mailIcon} aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <a href={`mailto:${EMAIL}`} className={styles.emailLink}>
              {EMAIL}
            </a>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
