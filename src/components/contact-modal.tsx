"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./contact-modal.module.css";

export type ModalMode = "investor" | "partner";

type ContactModalProps = {
  mode: ModalMode | null;
  onClose: () => void;
};

const MODAL_CONFIG = {
  investor: {
    title: "Fuel our expansion",
    description:
      "Be part of Kulture's journey as we reimagine how physical products connect people, brands, and digital experiences. Let's discuss investment and the future we're building.",
    value: "abhishekhansdak53@gmail.com",
    href: "mailto:abhishekhansdak53@gmail.com",
    icon: "mail",
  },
  partner: {
    title: "Partner with Kulture",
    description:
      "Partner with Kulture to transform physical touchpoints into engaging digital experiences. Let's explore campaigns, venue collaborations, brand activations, and more.",
    value: "9798264985",
    href: "tel:9798264985",
    icon: "phone",
  },
} as const;

export default function ContactModal({ mode, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (mode) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [mode]);

  if (!mode || !mounted) return null;

  const config = MODAL_CONFIG[mode];

  const handleCopy = async () => {
    triggerHaptic("success");
    try {
      await navigator.clipboard.writeText(config.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = config.value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const modalContent = (
    <div
      className={styles.backdrop}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="contact-modal-title" className={styles.title}>
            {config.title}
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

        <p className={styles.description}>{config.description}</p>

        <div className={styles.emailBox}>
          <div className={styles.emailLeft}>
            <span className={styles.mailIcon} aria-hidden="true">
              {config.icon === "mail" ? (
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
              ) : (
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              )}
            </span>
            <a href={config.href} className={styles.emailLink}>
              {config.value}
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

  return createPortal(modalContent, document.body);
}
