// Native — builds a short WAV in memory and plays via expo-av.
// playsInSilentModeIOS: false → hardware mute switch silences it.
// Same pattern as useLunarRevealSound.native.ts.

import { useRef } from 'react'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import type { SignalSoundHook } from './useSignalSound'

const SAMPLE_RATE = 44100
const DURATION    = 0.70  // seconds

function buildWav(): Uint8Array {
  const n       = Math.floor(SAMPLE_RATE * DURATION)
  const samples = new Float32Array(n)

  // Rising crystal ping: 440 Hz → 880 Hz, 0 → 0.35 s
  {
    const sweepN = Math.floor(0.35 * SAMPLE_RATE)
    let phase = 0
    for (let i = 0; i < sweepN; i++) {
      const t   = i / SAMPLE_RATE
      const f   = 440 * Math.pow(2, t / 0.35)   // exponential pitch rise
      phase    += (2 * Math.PI * f) / SAMPLE_RATE
      const env = t < 0.04 ? t / 0.04 : t > 0.30 ? (0.35 - t) / 0.05 : 1
      samples[i] += 0.07 * Math.max(0, env) * Math.sin(phase)
    }
  }

  // Tail decay: 880 Hz, 0.35 s → 0.70 s
  {
    const tailStart = Math.floor(0.35 * SAMPLE_RATE)
    const tailN     = n - tailStart
    let phase = 0
    for (let i = 0; i < tailN; i++) {
      const t = i / SAMPLE_RATE
      phase  += (2 * Math.PI * 880) / SAMPLE_RATE
      const env = Math.exp(-t * 4.5)
      samples[tailStart + i] += 0.07 * env * Math.sin(phase)
    }
  }

  // Subtle shimmer harmonic: 1320 Hz, fades by 0.25 s
  {
    const shimN = Math.floor(0.25 * SAMPLE_RATE)
    let phase = 0
    for (let i = 0; i < shimN; i++) {
      const t = i / SAMPLE_RATE
      phase  += (2 * Math.PI * 1320) / SAMPLE_RATE
      const env = t < 0.04 ? t / 0.04 : (0.25 - t) / 0.21
      samples[i] += 0.018 * Math.max(0, env) * Math.sin(phase)
    }
  }

  // Pack 16-bit PCM WAV
  const buf = new ArrayBuffer(44 + n * 2)
  const v   = new DataView(buf)
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i))
  }
  str(0,  'RIFF'); v.setUint32(4,  36 + n * 2, true)
  str(8,  'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true)
  v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, SAMPLE_RATE, true); v.setUint32(28, SAMPLE_RATE * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, n * 2, true)
  for (let i = 0; i < n; i++) {
    v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), true)
  }
  return new Uint8Array(buf)
}

function toBase64(bytes: Uint8Array): string {
  const CHUNK = 8192
  let out = ''
  for (let o = 0; o < bytes.length; o += CHUNK) {
    out += String.fromCharCode(...bytes.subarray(o, o + CHUNK))
  }
  return btoa(out)
}

export function useSignalSound(): SignalSoundHook {
  const soundRef = useRef<Audio.Sound | null>(null)

  async function play() {
    try {
      await soundRef.current?.unloadAsync().catch(() => {})
      soundRef.current = null

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS:    false,   // respects hardware mute switch
        staysActiveInBackground: false,
      })

      const wavBytes = buildWav()
      const b64      = toBase64(wavBytes)
      const uri      = `${FileSystem.cacheDirectory}signal_reveal.wav`
      await FileSystem.writeAsStringAsync(uri, b64, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.75 },
      )
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate(status => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync().catch(() => {})
          soundRef.current = null
        }
      })
    } catch {
      // Silent fail — sound is enhancement, not core UX
    }
  }

  function cleanup() {
    soundRef.current?.unloadAsync().catch(() => {})
    soundRef.current = null
  }

  return { play, cleanup }
}
