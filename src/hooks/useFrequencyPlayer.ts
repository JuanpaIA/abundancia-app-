// Web implementation — uses WebAudio API directly (no expo-av needed on web).
// Metro resolves useFrequencyPlayer.native.ts on iOS/Android instead of this file.

import { useState, useRef } from 'react'

// Public interface — callers depend only on this shape, never on the audio backend.
// Both this file and useFrequencyPlayer.native.ts must satisfy FrequencyPlayerHook.
export type FrequencyPlayerHook = {
  playing: boolean
  play: (hz: number) => Promise<void>
  stop: () => Promise<void>
}

export function useFrequencyPlayer(): FrequencyPlayerHook {
  const [playing, setPlaying] = useState(false)
  const ctxRef     = useRef<AudioContext | null>(null)
  const oscRef     = useRef<OscillatorNode | null>(null)
  const gainRef    = useRef<GainNode | null>(null)
  const playingRef = useRef(false)

  async function play(hz: number): Promise<void> {
    if (playingRef.current) { await stop(); return }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    const ctx: AudioContext = new Ctx()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = hz
    osc.type = 'sine'
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.5)
    osc.start()
    ctxRef.current  = ctx
    oscRef.current  = osc
    gainRef.current = gain
    playingRef.current = true
    setPlaying(true)
  }

  async function stop(): Promise<void> {
    playingRef.current = false
    if (!gainRef.current || !ctxRef.current) return
    gainRef.current.gain.linearRampToValueAtTime(0, ctxRef.current.currentTime + 1)
    setTimeout(() => {
      oscRef.current?.stop()
      ctxRef.current?.close()
      setPlaying(false)
    }, 1000)
  }

  return { playing, play, stop }
}
