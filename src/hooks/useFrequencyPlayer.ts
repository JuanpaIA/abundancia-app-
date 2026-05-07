import { useState, useRef } from 'react'
import { Platform, Alert } from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'

// ── Genera un buffer WAV de onda sinusoidal ───────────────────────────────────

function generateSineWaveWav(hz: number, durationSec = 5, sampleRate = 44100): Uint8Array {
  const numSamples = Math.floor(sampleRate * durationSec)
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataSize = numSamples * blockAlign
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  const fadeFrames = sampleRate * 1
  for (let i = 0; i < numSamples; i++) {
    let amplitude = 0.3
    if (i < fadeFrames) amplitude *= i / fadeFrames
    else if (i > numSamples - fadeFrames) amplitude *= (numSamples - i) / fadeFrames
    const sample = Math.round(amplitude * 32767 * Math.sin((2 * Math.PI * hz * i) / sampleRate))
    view.setInt16(44 + i * 2, sample, true)
  }

  return new Uint8Array(buffer)
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  const CHUNK = 8192
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK))
  }
  return btoa(binary)
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useFrequencyPlayer() {
  const [playing, setPlaying] = useState(false)

  // Web
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  // Móvil
  const soundRef = useRef<Audio.Sound | null>(null)
  const tempFileRef = useRef<string | null>(null)

  async function play(hz: number) {
    if (playing) {
      await stop()
      return
    }

    if (Platform.OS === 'web') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()
      oscillator.connect(gain)
      gain.connect(ctx.destination)
      oscillator.frequency.value = hz
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.5)
      oscillator.start()
      audioCtxRef.current = ctx
      oscillatorRef.current = oscillator
      gainRef.current = gain
      setPlaying(true)
    } else {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        })

        // Generar WAV y escribir a archivo temporal
        const wavBytes = generateSineWaveWav(hz)
        const base64 = uint8ArrayToBase64(wavBytes)
        const fileUri = `${FileSystem.cacheDirectory}freq_${hz}.wav`
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: 'base64' as any,
        })
        tempFileRef.current = fileUri

        const { sound } = await Audio.Sound.createAsync(
          { uri: fileUri },
          { shouldPlay: true, isLooping: true, volume: 0.7 }
        )
        soundRef.current = sound
        setPlaying(true)
      } catch (e: any) {
        Alert.alert('Error frecuencia', String(e?.message ?? e))
      }
    }
  }

  async function stop() {
    if (Platform.OS === 'web') {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1)
        setTimeout(() => {
          oscillatorRef.current?.stop()
          audioCtxRef.current?.close()
          setPlaying(false)
        }, 1000)
      }
    } else {
      if (soundRef.current) {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
        setPlaying(false)
      }
    }
  }

  return { playing, play, stop }
}
