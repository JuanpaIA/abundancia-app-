// Web implementation — WebAudio API for synthesized tones, HTMLAudioElement for assets.
// Metro resolves celebrationSound.native.ts on iOS/Android instead of this file.

import { ManifestationArea } from '@lumina/core'

// ── Tone data ─────────────────────────────────────────────────────────────────

interface Tone {
  hz: number
  startSec: number
  durationSec: number
  amplitude: number
  waveType: 'sine' | 'triangle' | 'noise'
  attackSec: number
}

const AREA_TONES: Record<ManifestationArea, Tone[]> = {
  dinero: [
    { hz: 0,    startSec: 0.000, durationSec: 0.018, amplitude: 0.45, waveType: 'noise',    attackSec: 0.001 },
    { hz: 160,  startSec: 0.000, durationSec: 0.030, amplitude: 0.28, waveType: 'triangle', attackSec: 0.001 },
    { hz: 490,  startSec: 0.000, durationSec: 0.040, amplitude: 0.20, waveType: 'triangle', attackSec: 0.001 },
    { hz: 1320, startSec: 0.038, durationSec: 0.560, amplitude: 0.48, waveType: 'triangle', attackSec: 0.004 },
    { hz: 2100, startSec: 0.038, durationSec: 0.320, amplitude: 0.26, waveType: 'triangle', attackSec: 0.002 },
    { hz: 3960, startSec: 0.038, durationSec: 0.150, amplitude: 0.12, waveType: 'triangle', attackSec: 0.001 },
    { hz: 5280, startSec: 0.038, durationSec: 0.075, amplitude: 0.06, waveType: 'triangle', attackSec: 0.001 },
  ],
  amor: [
    { hz: 261, startSec: 0.00, durationSec: 0.42, amplitude: 0.35, waveType: 'sine', attackSec: 0.06 },
    { hz: 329, startSec: 0.22, durationSec: 0.42, amplitude: 0.35, waveType: 'sine', attackSec: 0.06 },
    { hz: 392, startSec: 0.44, durationSec: 0.58, amplitude: 0.38, waveType: 'sine', attackSec: 0.06 },
  ],
  salud: [
    { hz: 440, startSec: 0.00, durationSec: 0.22, amplitude: 0.40, waveType: 'sine', attackSec: 0.02 },
    { hz: 554, startSec: 0.18, durationSec: 0.22, amplitude: 0.40, waveType: 'sine', attackSec: 0.02 },
    { hz: 659, startSec: 0.36, durationSec: 0.42, amplitude: 0.45, waveType: 'sine', attackSec: 0.02 },
  ],
  proposito: [
    { hz: 392, startSec: 0.00, durationSec: 0.26, amplitude: 0.45, waveType: 'sine', attackSec: 0.01 },
    { hz: 523, startSec: 0.24, durationSec: 0.26, amplitude: 0.45, waveType: 'sine', attackSec: 0.01 },
    { hz: 784, startSec: 0.48, durationSec: 0.62, amplitude: 0.50, waveType: 'sine', attackSec: 0.02 },
  ],
  felicidad: [
    { hz: 523,  startSec: 0.00, durationSec: 0.18, amplitude: 0.40, waveType: 'sine', attackSec: 0.02 },
    { hz: 659,  startSec: 0.17, durationSec: 0.18, amplitude: 0.40, waveType: 'sine', attackSec: 0.02 },
    { hz: 784,  startSec: 0.34, durationSec: 0.18, amplitude: 0.40, waveType: 'sine', attackSec: 0.02 },
    { hz: 1047, startSec: 0.51, durationSec: 0.44, amplitude: 0.45, waveType: 'sine', attackSec: 0.02 },
  ],
}

// ── WebAudio helpers ──────────────────────────────────────────────────────────

function scheduleNoise(ctx: AudioContext, dest: AudioNode, tone: Tone) {
  const len = Math.ceil(ctx.sampleRate * tone.durationSec)
  const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let j = 0; j < len; j++) data[j] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = noiseBuf
  const gain = ctx.createGain()
  src.connect(gain); gain.connect(dest)
  const t0 = ctx.currentTime + tone.startSec
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(tone.amplitude, t0 + tone.attackSec)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + tone.durationSec)
  src.start(t0); src.stop(t0 + tone.durationSec + 0.01)
}

function scheduleOsc(ctx: AudioContext, dest: AudioNode, tone: Tone & { waveType: 'sine' | 'triangle' }) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain); gain.connect(dest)
  osc.type = tone.waveType
  osc.frequency.value = tone.hz
  const t0 = ctx.currentTime + tone.startSec
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(tone.amplitude, t0 + tone.attackSec)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + tone.durationSec)
  osc.start(t0); osc.stop(t0 + tone.durationSec + 0.01)
}

// ── Asset playback — play() rejects when autoplay is blocked, always catch ───

const DINERO_ASSET = require('../../assets/sounds/dinero.mp3') as string

async function playAsset(src: string): Promise<void> {
  if (typeof window === 'undefined') return
  const AudioClass = (window as any).Audio
  if (!AudioClass) return
  const el: { play: () => Promise<void> } = new AudioClass(src)
  try { await el.play() } catch { /* autoplay blocked or unsupported — silent fail */ }
}

// ── Public ────────────────────────────────────────────────────────────────────

export async function playCelebrationSound(area: ManifestationArea): Promise<void> {
  if (area === 'dinero') {
    await playAsset(DINERO_ASSET)
    return
  }

  const tones = AREA_TONES[area]
  try {
    const CtxClass = window.AudioContext || (window as any).webkitAudioContext
    if (!CtxClass) return
    const ctx: AudioContext = new CtxClass()
    for (const tone of tones) {
      if (tone.waveType === 'noise') scheduleNoise(ctx, ctx.destination, tone)
      else scheduleOsc(ctx, ctx.destination, tone as Tone & { waveType: 'sine' | 'triangle' })
    }
    const totalSec = Math.max(...tones.map(t => t.startSec + t.durationSec))
    setTimeout(() => { try { ctx.close() } catch {} }, (totalSec + 0.5) * 1000)
  } catch {}
}
