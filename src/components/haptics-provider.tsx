"use client";

import { useEffect } from "react";
import { triggerHaptic, HapticPresetName } from "@/lib/haptics";

export default function HapticsProvider() {
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      // Find closest interactive element
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "button, [role='button'], a, input[type='submit'], input[type='button'], .is-clickable"
      ) as HTMLElement | null;

      if (interactive) {
        const customType = (interactive.dataset.haptic as HapticPresetName) || "light";
        triggerHaptic(customType);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}
