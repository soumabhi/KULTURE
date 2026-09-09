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
  | "buzz"
  | "deep"
  | "logo"
  | "link";

let hapticsInstance: WebHaptics | null = null;
let audioCtx: AudioContext | null = null;

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
 * High-definition vibration patterns for the Navigator Vibration API.
 * Uses calibrated multi-pulse timings to deliver deep mechanical click feel.
 */
const VIBRATION_PATTERNS: Record<string, number | number[]> = {
  deep: [52, 28, 48],           // Deep, heavy double mechanical thump for buttons
  heavy: [58, 30, 52],          // Extra heavy punch
  logo: [68, 32, 85],           // Deep resonant motor spin pulse for Kulture logo
  link: [34, 22, 24],           // Crisp, clear tactile click for navigation links
  medium: [40, 24, 34],         // Solid tactile pulse
  light: 30,                    // Gentle tap
  success: [45, 30, 55, 25, 75],// Satisfying multi-stage success vibration
  selection: 24,
};

/**
 * Synthesizes a deep sub-bass physical tactile click via Web Audio API.
 * Gives desktop/laptop trackpads and headphones a satisfying physical thump.
 */
function playTactileThump(freq = 68, duration = 0.045) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      28,
      audioCtx.currentTime + duration
    );

    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // Fail silently if blocked by user autoplay policy
  }
}

/**
 * Triggers rich, deep haptic feedback across buttons, links, and the Kulture logo.
 * Combines hardware vibration, iOS WebKit taptic triggers, and sub-bass tactile audio.
 */
export function triggerHaptic(
  input: HapticInput | HapticPresetName = "deep",
  options?: TriggerOptions
) {
  if (typeof window === "undefined") return;

  const key = typeof input === "string" ? input : "deep";

  // 1. Direct hardware vibration with deep multi-pulse waveform
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      const pattern = VIBRATION_PATTERNS[key] || [50, 25, 45];
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors on unsupported devices
    }
  }

  // 2. iOS Taptic / WebKit actuator trigger via web-haptics
  try {
    const instance = getWebHaptics();
    if (instance) {
      if (typeof input === "string" && input in defaultPatterns) {
        instance.trigger(
          defaultPatterns[input as keyof typeof defaultPatterns],
          options
        );
      } else if (key === "deep" || key === "logo") {
        instance.trigger(defaultPatterns.heavy, options);
      } else if (key === "link") {
        instance.trigger(defaultPatterns.medium, options);
      } else {
        instance.trigger(input as HapticInput, options);
      }
    }
  } catch {
    // Fail silently in unsupported environments
  }

  // 3. Deep tactile sub-bass acoustic thump
  try {
    if (key === "deep" || key === "heavy") {
      playTactileThump(68, 0.045);
    } else if (key === "logo") {
      playTactileThump(52, 0.07);
    } else if (key === "link") {
      playTactileThump(85, 0.03);
    }
  } catch {
    // Fail silently
  }
}

export { WebHaptics, defaultPatterns };


