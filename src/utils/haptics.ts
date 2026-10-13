import confetti from 'canvas-confetti';

/**
 * Hardware Haptic Feedback via `navigator.vibrate`
 */
export const haptics = {
  /** Micro-tick on each pawn step hop */
  stepHop() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Ignore on unsupported desktop browsers
      }
    }
  },

  /** Double haptic bump when rolling a 6 (exact spec from prompt) */
  rolledSix() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Ignore
      }
    }
  },

  /** Heavy impact vibration when capturing an opponent pawn */
  pawnCaptured() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([80, 40, 120]);
      } catch {
        // Ignore
      }
    }
  },

  /** Celebratory rhythm when a token enters Home or player wins */
  victory() {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 50, 60, 50, 180]);
      } catch {
        // Ignore
      }
    }
  },
};

/**
 * Canvas Confetti bursts for Home Reach and Match Victory
 */
export function triggerHomeReachConfetti() {
  confetti({
    particleCount: 55,
    spread: 65,
    origin: { y: 0.55 },
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#a855f7'],
  });
}

export function triggerMatchWinConfetti() {
  const duration = 2600;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#fbbf24', '#3b82f6', '#ef4444', '#22c55e'],
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#fbbf24', '#3b82f6', '#ef4444', '#22c55e'],
    });
    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
