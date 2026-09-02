// Web implementation — WebAudio API. Metro resolves .native.ts on iOS/Android.
// CRITICAL: Web has no hardware mute switch, so we just keep volume low.

import { useRef } from 'react'
import type { AlignmentTier } from '@lumina/core'

const CHORD_FREQS: Record<AlignmentTier, number[]> = {
  action:    [523.25, 659.25, 783.99],   // C5-E5-G5 major, bright high register
  building:  [392.00, 493.88, 587.33],   // G4-B4-D5 open suspended feel
  reception: [261.63, 311.13, 392.00],   // C4-Eb4-G4 minor, deep low register
}

export interface LunarRevealSoundHook {
  play:    (tier: AlignmentTier) => void
  cleanup: () => void
}

export function useLunarRevealSound(): LunarRevealSoundHook {
  const ctxRef = useRef<AudioContext | null>(null)

  function play(tier: AlignmentTier) {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return
      ctxRef.current?.close().catch(() => {})
      const ctx: AudioContext = new Ctx()
      ctxRef.current = ctx
      const t = ctx.currentTime

      // Rising glissando: 80 Hz → 360 Hz over 0.6 s
      const riseOsc  = ctx.createOscillator()
      const riseGain = ctx.createGain()
      riseOsc.connect(riseGain)
      riseGain.connect(ctx.destination)
      riseOsc.type = 'sine'
      riseOsc.frequency.setValueAtTime(80, t)
      riseOsc.frequency.exponentialRampToValueAtTime(360, t + 0.6)
      riseGain.gain.setValueAtTime(0, t)
      riseGain.gain.linearRampToValueAtTime(0.06, t + 0.06)
      riseGain.gain.setValueAtTime(0.06, t + 0.54)
      riseGain.gain.linearRampToValueAtTime(0, t + 0.65)
      riseOsc.start(t)
      riseOsc.stop(t + 0.7)

      // Chord resolves at 0.6 s, decays with reverb tail over 1.5 s
      CHORD_FREQS[tier].forEach(f => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = f
        gain.gain.setValueAtTime(0, t + 0.6)
        gain.gain.linearRampToValueAtTime(0.09 / 3, t + 0.66)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2)
        osc.start(t + 0.6)
        osc.stop(t + 2.3)
      })
    } catch {
      // Audio unavailable — silent fail
    }
  }

  function cleanup() {
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }

  return { play, cleanup }
}
