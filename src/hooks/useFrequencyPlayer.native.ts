// Native implementation — expo-av (SDK 53).
// TODO(SDK-54): migrate to expo-audio when upgrading to Expo SDK 54.
//   Audio.setAudioModeAsync      → AudioMode config on the useAudioPlayer hook
//   Audio.Sound.createAsync      → useAudioPlayer(source) + player.play()
//   FileSystem.writeAsStringAsync → stays (expo-file-system is stable)
//   Public interface { playing, play, stop } is unchanged — internal-only swap.

import { useState, useRef } from 'react'
import { Alert } from 'react-native'
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import type { FrequencyPlayerHook } from './useFrequencyPlayer'

// ── WAV synthesis ─────────────────────────────────────────────────────────────

function buildSineWav(hz: number, durationSec = 5, sampleRate = 44100): Uint8Array {
  const n = Math.floor(sampleRate * durationSec)
  const buf = new ArrayBuffer(44 + n * 2)
  const v   = new DataView(buf)
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i))
  }
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true)
  str(8, 'WAVE'); str(12, 'fmt '); v.setUint32(16, 16, true)
  v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, n * 2, true)

  const fade = sampleRate
  for (let i = 0; i < n; i++) {
    let amp = 0.3
    if (i < fade) amp *= i / fade
    else if (i > n - fade) amp *= (n - i) / fade
    v.setInt16(44 + i * 2, Math.round(amp * 32767 * Math.sin(2 * Math.PI * hz * i / sampleRate)), true)
  }
  return new Uint8Array(buf)
}

function toBase64(bytes: Uint8Array): string {
  const CHUNK = 8192
  let out = ''
  for (let o = 0; o < bytes.length; o += CHUNK) out += String.fromCharCode(...bytes.subarray(o, o + CHUNK))
  return btoa(out)
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useFrequencyPlayer(): FrequencyPlayerHook {
  const [playing, setPlaying] = useState(false)
  const soundRef   = useRef<Audio.Sound | null>(null)
  const playingRef = useRef(false)

  async function play(hz: number): Promise<void> {
    if (playingRef.current) { await stop(); return }
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false,
        allowsRecordingIOS: false,
        playThroughEarpieceAndroid: false,
      })
      const fileUri = `${FileSystem.cacheDirectory}freq_${hz}.wav`
      await FileSystem.writeAsStringAsync(fileUri, toBase64(buildSineWav(hz)), { encoding: 'base64' as any })
      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true, isLooping: true, volume: 0.7 }
      )
      soundRef.current = sound
      playingRef.current = true
      setPlaying(true)
    } catch (e: any) {
      Alert.alert('Error frecuencia', String(e?.message ?? e))
    }
  }

  async function stop(): Promise<void> {
    playingRef.current = false
    if (!soundRef.current) return
    await soundRef.current.stopAsync()
    await soundRef.current.unloadAsync()
    soundRef.current = null
    setPlaying(false)
  }

  return { playing, play, stop }
}
