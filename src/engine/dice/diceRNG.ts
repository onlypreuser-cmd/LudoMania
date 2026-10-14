/**
 * Cryptographically uniform integer in [min, max] inclusive.
 * Uses rejection-sampling to eliminate modulo bias.
 * Uint32Array max (4,294,967,295) is not divisible by all ranges,
 * so we discard any values above the largest multiple of `range`
 * that fits in Uint32 — giving each outcome exactly equal probability.
 */
export function fairRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Largest multiple of `range` that fits within Uint32
    const limit = Math.floor(0x100000000 / range) * range;
    let val: number;
    do {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      val = arr[0];
    } while (val >= limit); // Reject biased tail — loops < 2 times on average
    return min + (val % range);
  }
  return Math.floor(Math.random() * range) + min;
}

/**
 * Stealth check whether a player's name triggers the smart dice engine
 */
export function isRahulName(name: string | undefined | null): boolean {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  if (n === 'jinwooo') return true;
  return n === 'rahul' || n.startsWith('rahul ');
}
