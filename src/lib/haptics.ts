import { WebHaptics, defaultPatterns, type HapticInput, type TriggerOptions } from "web-haptics";

export type HapticPresetName =
  | "selection"
  | "light"
  | "medium"
  | "heavy"
  | "soft"
  | "rigid"
  | "success"
  | "warning"
  | "error"
  | "nudge"
  | "buzz";

let hapticsInstance: WebHaptics | null = null;

export function getWebHaptics(): WebHaptics | null {
  if (typeof window === "undefined") return null;
  if (!hapticsInstance) {
    try {
      hapticsInstance = new WebHaptics();
    } catch {
      hapticsInstance = null;
    }
  }
  return hapticsInstance;
}

/**
 * Triggers haptic feedback using web-haptics.
 * Supports preset names ("light", "medium", "heavy", "success", etc.)
 * or custom pattern objects/arrays.
 */
export function triggerHaptic(
  input: HapticInput | HapticPresetName = "light",
  options?: TriggerOptions
) {
  if (typeof window === "undefined") return;

  try {
    const instance = getWebHaptics();
    if (instance) {
      if (typeof input === "string" && input in defaultPatterns) {
        instance.trigger(defaultPatterns[input as keyof typeof defaultPatterns], options);
      } else {
        instance.trigger(input as HapticInput, options);
      }
    }
  } catch {
    // Fail silently in unsupported environments
  }
}

export { WebHaptics, defaultPatterns };

