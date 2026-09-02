// Native implementation — expo-av.
// CRITICAL: playsInSilentModeIOS: false so the hardware mute switch silences it.
// This is the opposite of useFrequencyPlayer.native.ts which intentionally bypasses mute.

import { useRef } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import type { AlignmentTier } from '@lumina/core'
import type { LunarRevealSoundHook } from './useLunarRevealSound'

const CHORD_FREQS: Record<AlignmentTier, number[]> = {
  action:    [523.25, 659.25, 783.99],
  building:  [392.00, 493.88, 587.33],
  reception: [261.63, 311.13, 392.00],
}

function buildWav(tier: AlignmentTier, sampleRate = 44100): Uint8Array {
  const DURATION = 2.2
  const n        = Math.floor(sampleRate * DURATION)
  const samples  = new Float32Array(n)

  // Rising glissando: linear sweep 80 Hz → 360 Hz, 0 → 0.6 s
  {
    const sweepN = Math.floor(0.6 * sampleRate)
    let phase = 0
    for (let i = 0; i < sweepN; i++) {
      const t   = i / sampleRate
      const f   = 80 + (360 - 80) * (t / 0.6)
      phase    += (2 * Math.PI * f) / sampleRate
      const env = t < 0.06 ? t / 0.06 : t > 0.54 ? (0.6 - t) / 0.06 : 1
      samples[i] += 0.06 * env * Math.sin(phase)
    }
  }

  // Chord: 0.6 s → 2.2 s, attack + exponential decay
  {
    const startN  = Math.floor(0.6 * sampleRate)
    const chordN  = n - startN
    const freqs   = CHORD_FREQS[tier]
    freqs.forEach(f => {
      for (let i = 0; i < chordN; i++) {
        const ct      = i / sampleRate
        const attack  = ct < 0.06 ? ct / 0.06 : 1
        const decay   = Math.exp(-ct * 1.2)
        samples[startN + i] += (0.09 / freqs.length) * attack * decay * Math.sin(2 * Math.PI * f * ct)
      }
    })
  }

  // Pack 16-bit PCM WAV
  const buf = new ArrayBuffer(44 + n * 2)
  const v   = new DataView(buf)
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }
  str(0, 'RIFF');  v.setUint32(4, 36 + n * 2, true)
  str(8, 'WAVE');  str(12, 'fmt ');  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true);  v.setUint16(22, 1, true)          // PCM, mono
  v.setUint32(24, sampleRate, true);  v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true);  v.setUint16(34, 16, true)
  str(36, 'data');  v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), true)
  }
  return new Uint8Array(buf)
}

function toBase64(bytes: Uint8Array): string {
  const CHUNK = 8192
  let out = ''
  for (let o = 0; o < bytes.length; o += CHUNK) out += String.fromCharCode(...bytes.subarray(o, o + CHUNK))
  return btoa(out)
}

export function useLunarRevealSound(): LunarRevealSoundHook {
  const soundRef = useRef<Audio.Sound | null>(null)

  async function play(tier: AlignmentTier) {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS:       false,   // respect hardware mute switch
        staysActiveInBackground:    false,
        allowsRecordingIOS:         false,
        playThroughEarpieceAndroid: false,
      })
      const uri = `${FileSystem.cacheDirectory}lrv_${tier}.wav`
      await FileSystem.writeAsStringAsync(uri, toBase64(buildWav(tier)), { encoding: 'base64' as any })
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: false, volume: 0.45 },
      )
      soundRef.current = sound
    } catch {
      // Silent fail — sound is decorative
    }
  }

  async function cleanup() {
    if (!soundRef.current) return
    try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync() } catch {}
    soundRef.current = null
  }

  return { play, cleanup }
}
