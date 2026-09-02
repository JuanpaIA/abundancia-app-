// Web — WebAudio API synthesizes the reveal tone on demand.
// Metro resolves useSignalSound.native.ts on iOS/Android automatically.
// playsInSilentModeIOS is irrelevant on web; volume stays low so it never startles.

import { useRef } from 'react'

export interface SignalSoundHook {
  play:    () => void
  cleanup: () => void
}

export function useSignalSound(): SignalSoundHook {
  const ctxRef = useRef<AudioContext | null>(null)

  function play() {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!Ctx) return
      ctxRef.current?.close().catch(() => {})
      const ctx: AudioContext = new Ctx()
      ctxRef.current = ctx
      const t = ctx.currentTime

      // Rising crystal ping: 440 Hz → 880 Hz over 0.35 s, soft tail to 0.65 s
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, t)
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.35)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.07, t + 0.04)
      gain.gain.setValueAtTime(0.07, t + 0.30)
      gain.gain.linearRampToValueAtTime(0, t + 0.65)
      osc.start(t)
      osc.stop(t + 0.70)

      // Subtle shimmer: 1320 Hz (third harmonic), very quiet, cuts at 0.25 s
      const shimOsc  = ctx.createOscillator()
      const shimGain = ctx.createGain()
      shimOsc.connect(shimGain)
      shimGain.connect(ctx.destination)
      shimOsc.type = 'sine'
      shimOsc.frequency.setValueAtTime(1320, t)
      shimGain.gain.setValueAtTime(0, t)
      shimGain.gain.linearRampToValueAtTime(0.018, t + 0.04)
      shimGain.gain.linearRampToValueAtTime(0, t + 0.25)
      shimOsc.start(t)
      shimOsc.stop(t + 0.30)
    } catch {
      // AudioContext may be blocked before user interaction — silent fail
    }
  }

  function cleanup() {
    ctxRef.current?.close().catch(() => {})
    ctxRef.current = null
  }

  return { play, cleanup }
}
