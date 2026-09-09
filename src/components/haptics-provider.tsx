"use client";

import { useEffect } from "react";
import { triggerHaptic, HapticPresetName } from "@/lib/haptics";

export default function HapticsProvider() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // 1. Logo / Konark Chakra target
      const logo = target.closest(
        ".lockup, [aria-label='Kulture'], [class*='lockup'], [class*='chakra'], [class*='logo']"
      ) as HTMLElement | null;
      if (logo) {
        triggerHaptic("logo");
        return;
      }

      // 2. Interactive elements (buttons, links, inputs)
      const interactive = target.closest(
        "button, [role='button'], a, input[type='submit'], input[type='button'], .is-clickable, [class*='keycap']"
      ) as HTMLElement | null;

      if (interactive) {
        // Explicit override via data-haptic
        if (interactive.dataset.haptic) {
          triggerHaptic(interactive.dataset.haptic as HapticPresetName);
          return;
        }

        // Links get crisp tactile link vibration
        if (interactive.tagName.toLowerCase() === "a") {
          triggerHaptic("link");
          return;
        }

        // Buttons, keycaps, and role='button' get deep mechanical vibration
        triggerHaptic("deep");
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}
