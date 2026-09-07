"use client";

import type { ButtonHTMLAttributes, PointerEvent, ReactNode } from "react";
import Link from "next/link";
import { triggerHaptic } from "@/lib/haptics";
import styles from "./keycap-button.module.css";

type KeycapButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function KeycapButton({
  children,
  className,
  type = "button",
  onPointerDown,
  ...props
}: KeycapButtonProps) {
  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    triggerHaptic("medium");
    if (onPointerDown) onPointerDown(e);
  };

  return (
    <button
      type={type}
      className={className ? `${styles.keycap} ${className}` : styles.keycap}
      onPointerDown={handlePointerDown}
      {...props}
    >
      <span className={styles.letter}>{children}</span>
    </button>
  );
}

type KeycapLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
  onPointerDown?: (e: PointerEvent<HTMLAnchorElement>) => void;
};

export function KeycapLink({
  href,
  children,
  className,
  prefetch,
  onPointerDown,
}: KeycapLinkProps) {
  const handlePointerDown = (e: PointerEvent<HTMLAnchorElement>) => {
    triggerHaptic("medium");
    if (onPointerDown) onPointerDown(e);
  };

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={className ? `${styles.keycap} ${className}` : styles.keycap}
      onPointerDown={handlePointerDown}
    >
      <span className={styles.letter}>{children}</span>
    </Link>
  );
}
