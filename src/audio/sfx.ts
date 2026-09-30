// Audio engine berbasis Web Audio API — SFX di-synthesize (zero-asset).
// Catatan desain: brief menyebут Howler.js, tetapi Howler memerlukan file
// audio yang tidak tersedia. Sintesis Web Audio menghasilkan SFX tanpa aset
// sehingga bundle tetap kecil & 100% client-side. API dibuat sederhana
// (playStamp, playPaper, dst) agar mudah diganti ke Howler bila nanti ada aset.

type SfxName =
  | 'stampWood' // debukan stempel kayu
  | 'paperSlide' // gesekan kertas
  | 'click' // klik mouse/keyboard
  | 'mortarGrind' // gesekan alu porselen
  | 'bell' // bel interkom
  | 'correct' // ding benar
  | 'wrong' // buzz salah
  | 'alarm'; // sidak / fatal

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  // resume bila di-suspend (autoplay policy)
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function envGain(
  c: AudioContext,
  attack: number,
  decay: number,
  peak = 1,
): GainNode {
  const g = c.createGain();
  const now = c.currentTime;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(peak, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return g;
}

// noise buffer untuk tekstur (kertas, gesekan)
function noiseBuffer(c: AudioContext, dur: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function playNoise(
  c: AudioContext,
  dur: number,
  filterFreq: number,
  peak: number,
) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c, dur);
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  const g = envGain(c, 0.005, dur, peak);
  src.connect(filter).connect(g).connect(master!);
  src.start();
  src.stop(c.currentTime + dur + 0.05);
}

function playTone(
  c: AudioContext,
  freq: number,
  dur: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = envGain(c, 0.005, dur, peak);
  osc.connect(g).connect(master!);
  osc.start();
  osc.stop(c.currentTime + dur + 0.05);
}

export function playSfx(name: SfxName) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) return;

  switch (name) {
    case 'stampWood': {
      // thud rendah + klik
      playTone(c, 90, 0.12, 'sine', 0.9);
      playNoise(c, 0.06, 1200, 0.4);
      break;
    }
    case 'paperSlide':
      playNoise(c, 0.25, 3500, 0.18);
      break;
    case 'click':
      playNoise(c, 0.03, 2500, 0.25);
      break;
    case 'mortarGrind':
      playNoise(c, 0.4, 900, 0.22);
      break;
    case 'bell':
      playTone(c, 880, 0.4, 'sine', 0.4);
      playTone(c, 1320, 0.4, 'sine', 0.2);
      break;
    case 'correct':
      playTone(c, 660, 0.12, 'sine', 0.5);
      setTimeout(() => playTone(c, 990, 0.18, 'sine', 0.5), 90);
      break;
    case 'wrong':
      playTone(c, 220, 0.25, 'sawtooth', 0.4);
      setTimeout(() => playTone(c, 160, 0.3, 'sawtooth', 0.4), 120);
      break;
    case 'alarm':
      playTone(c, 700, 0.2, 'square', 0.35);
      setTimeout(() => playTone(c, 500, 0.2, 'square', 0.35), 220);
      setTimeout(() => playTone(c, 700, 0.2, 'square', 0.35), 440);
      break;
  }
}

export function setMuted(m: boolean) {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

// Panggil sekali pada interaksi pengguna pertama untuk membuka AudioContext.
export function unlockAudio() {
  ensureCtx();
}
