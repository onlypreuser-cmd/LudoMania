import { Howl } from 'howler';

export type SoundSpriteKey =
  | 'dice_roll'
  | 'pawn_step'
  | 'pawn_kill'
  | 'safe_star'
  | 'home_reach'
  | 'extra_turn'
  | 'timer_warn'
  | 'win_fanfare'
  | 'ui_click';

/**
 * Generates a single 5.2-second 44.1kHz PCM WAV audio sprite in memory
 * containing all 9 game sound effects, then loads it into Howler.js
 * using Web Audio API (`html5: false`) for zero-latency concurrent playback.
 */
function buildMasterAudioSpriteDataUri(): string {
  const sampleRate = 44100;
  const durationSec = 5.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Float32Array(numSamples);

  const addTone = (
    startSec: number,
    lenSec: number,
    freqStart: number,
    freqEnd: number,
    gain: number,
    type: 'sine' | 'triangle' | 'square' | 'noise' = 'sine'
  ) => {
    const startIdx = Math.floor(startSec * sampleRate);
    const count = Math.floor(lenSec * sampleRate);
    let phase = 0;
    for (let i = 0; i < count && startIdx + i < numSamples; i++) {
      const t = i / count;
      const env = Math.sin(Math.min(1, t * 8) * (Math.PI / 2)) * Math.pow(1 - t, 1.6);
      const freq = freqStart + (freqEnd - freqStart) * t;
      phase += (2 * Math.PI * freq) / sampleRate;
      let sample = 0;
      if (type === 'sine') sample = Math.sin(phase);
      else if (type === 'triangle') sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
      else if (type === 'square') sample = Math.sin(phase) >= 0 ? 0.7 : -0.7;
      else sample = (Math.random() * 2 - 1) * Math.exp(-t * 6);

      buffer[startIdx + i] = Math.max(
        -0.98,
        Math.min(0.98, buffer[startIdx + i] + sample * gain * env)
      );
    }
  };

  // Physical acoustic click generator for realistic acrylic/ivory dice on a wooden board
  const addDiceBounce = (
    startSec: number,
    intensity: number,
    pitchMult: number
  ) => {
    const startIdx = Math.floor(startSec * sampleRate);
    const count = Math.floor(0.036 * sampleRate); // 36ms resonant decay
    let pLow = 0;
    let pMid = 0;
    let pHigh = 0;
    let prevNoise = 0;

    for (let i = 0; i < count && startIdx + i < numSamples; i++) {
      const sec = i / sampleRate;
      // Ultra-fast 0.6ms attack + natural exponential decay
      const attack = Math.min(1, sec / 0.0006);

      // 1. Warm wooden board thud (155Hz -> 115Hz)
      const fLow = (155 - 40 * (i / count)) * pitchMult;
      pLow += (2 * Math.PI * fLow) / sampleRate;
      const woodThud = Math.sin(pLow) * Math.exp(-sec * 125) * 0.48;

      // 2. Solid ivory/acrylic body modal ping (fixed non-sweeping formants)
      const fMid = 960 * pitchMult;
      const fHigh = 2240 * pitchMult;
      pMid += (2 * Math.PI * fMid) / sampleRate;
      pHigh += (2 * Math.PI * fHigh) / sampleRate;
      const bodyClick =
        (Math.sin(pMid) * 0.34 + Math.sin(pHigh) * 0.18) *
        Math.exp(-sec * 240);

      // 3. Band-limited surface contact transient (no harsh white-noise hiss)
      const rawNoise = Math.random() * 2 - 1;
      prevNoise = prevNoise * 0.62 + rawNoise * 0.38;
      const contactTick = prevNoise * Math.exp(-sec * 380) * 0.26;

      const sample = (woodThud + bodyClick + contactTick) * attack * intensity;
      buffer[startIdx + i] = Math.max(
        -0.98,
        Math.min(0.98, buffer[startIdx + i] + sample)
      );
    }
  };

  // 1. dice_roll (0.00s - 0.68s): Natural decelerating physical dice toss & board bounces
  const diceBounces = [
    { t: 0.015, gain: 0.46, pitch: 0.94 }, // Hand/pod release tap 1
    { t: 0.068, gain: 0.54, pitch: 1.02 }, // Hand/pod release tap 2
    { t: 0.165, gain: 0.92, pitch: 0.92 }, // Primary board drop impact
    { t: 0.305, gain: 0.72, pitch: 1.04 }, // First rebound landing
    { t: 0.415, gain: 0.54, pitch: 1.1 },  // Second rebound landing
    { t: 0.505, gain: 0.38, pitch: 1.16 }, // Micro-bounce
    { t: 0.575, gain: 0.25, pitch: 1.22 }, // Settle rock 1
    { t: 0.63, gain: 0.16, pitch: 1.26 },  // Final settle click
  ];
  diceBounces.forEach((b) => addDiceBounce(b.t, b.gain, b.pitch));

  // 2. pawn_step (0.72s - 0.86s): Warm tactile wooden piece hop & soft pop
  addDiceBounce(0.72, 0.45, 0.88);
  addTone(0.72, 0.085, 310, 520, 0.42, 'sine');

  // 3. pawn_kill (0.90s - 1.42s): Impact crunch + descending knockout sweep
  addTone(0.9, 0.12, 180, 55, 0.62, 'square');
  addDiceBounce(0.9, 0.85, 0.8);
  addTone(0.96, 0.4, 580, 115, 0.5, 'triangle');

  // 4. safe_star (1.45s - 1.90s): Sparkling C6-E6-G6-C7 shimmer
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    addTone(1.45 + idx * 0.075, 0.2, freq, freq * 1.005, 0.36, 'sine');
  });

  // 5. home_reach (1.92s - 2.52s): Triumphant arpeggio
  [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
    addTone(1.92 + idx * 0.085, 0.24, freq, freq, 0.4, 'triangle');
  });

  // 6. extra_turn (2.55s - 3.05s): Power-up double chime
  addTone(2.55, 0.18, 587.33, 587.33, 0.45, 'sine');
  addTone(2.72, 0.28, 880, 880, 0.5, 'sine');

  // 7. timer_warn (3.10s - 3.35s): Urgent tick
  addTone(3.1, 0.09, 880, 440, 0.4, 'square');

  // 8. win_fanfare (3.40s - 4.80s): Grand royal brass chord fanfare
  const fanfareNotes = [
    { t: 3.4, d: 0.18, f: 523.25 },
    { t: 3.58, d: 0.18, f: 659.25 },
    { t: 3.76, d: 0.18, f: 783.99 },
    { t: 3.95, d: 0.78, f: 1046.5 },
    { t: 3.95, d: 0.78, f: 659.25 },
  ];
  fanfareNotes.forEach((n) => {
    addTone(n.t, n.d, n.f, n.f, 0.4, 'triangle');
    addTone(n.t, n.d, n.f * 0.5, n.f * 0.5, 0.25, 'sine');
  });

  // 9. ui_click (4.85s - 4.98s): Crisp UI pop
  addTone(4.85, 0.06, 620, 940, 0.35, 'sine');

  // Encode Float32Array into 16-bit PCM WAV Base64 Data URI
  const wavBytes = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBytes);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  const uint8 = new Uint8Array(wavBytes);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < uint8.length; i += chunkSize) {
    binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}

class SoundSpriteManager {
  private howl: Howl | null = null;
  private enabled = true;

  private ensureHowl(): Howl | null {
    if (typeof window === 'undefined') return null;
    if (!this.howl) {
      const dataUri = buildMasterAudioSpriteDataUri();
      this.howl = new Howl({
        src: [dataUri],
        format: ['wav'],
        html5: false, // Force zero-latency Web Audio API
        volume: 0.85,
        sprite: {
          dice_roll: [0, 680],
          pawn_step: [720, 140],
          pawn_kill: [900, 520],
          safe_star: [1450, 450],
          home_reach: [1920, 600],
          extra_turn: [2550, 500],
          timer_warn: [3100, 250],
          win_fanfare: [3400, 1400],
          ui_click: [4850, 130],
        },
      });
    }
    return this.howl;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public play(key: SoundSpriteKey, rate = 1.0) {
    if (!this.enabled) return;
    const howl = this.ensureHowl();
    if (!howl) return;
    const soundId = howl.play(key);
    if (rate !== 1.0) {
      howl.rate(rate, soundId);
    }
  }
}

export const soundManager = new SoundSpriteManager();
