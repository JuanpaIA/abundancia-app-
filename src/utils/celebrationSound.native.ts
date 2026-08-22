// Native implementation — expo-av (SDK 53) + expo-haptics.
// TODO(SDK-54): migrate to expo-audio when upgrading to Expo SDK 54.
//   Audio.setAudioModeAsync      → AudioMode config on the useAudioPlayer hook
//   Audio.Sound.createAsync      → useAudioPlayer(source) + player.play()
//   FileSystem.writeAsStringAsync → stays (expo-file-system is stable)
//   expo-haptics                 → no changes needed, stays stable
//   Public signature playCelebrationSound(area) is unchanged — internal-only swap.

import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import * as Haptics from 'expo-haptics'
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

// ── WAV synthesis ─────────────────────────────────────────────────────────────

function buildWav(tones: Tone[], sampleRate = 44100): Uint8Array {
  const totalSec = Math.max(...tones.map(t => t.startSec + t.durationSec)) + 0.05
  const n = Math.ceil(sampleRate * totalSec)
  const buf = new ArrayBuffer(44 + n * 2)
  const v   = new DataView(buf)
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)) }

  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE')
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true)
  str(36, 'data'); v.setUint32(40, n * 2, true)

  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    let sample = 0
    for (const tone of tones) {
      const local = t - tone.startSec
      if (local < 0 || local > tone.durationSec) continue
      const env = local < tone.attackSec
        ? local / tone.attackSec
        : Math.exp(-3.5 * (local - tone.attackSec) / (tone.durationSec - tone.attackSec))
      let wave: number
      if (tone.waveType === 'noise') wave = Math.random() * 2 - 1
      else if (tone.waveType === 'triangle') { const p = tone.hz * t; wave = 1 - 4 * Math.abs(Math.round(p) - p) }
      else wave = Math.sin(2 * Math.PI * tone.hz * t)
      sample += tone.amplitude * env * wave
    }
    v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true)
  }
  return new Uint8Array(buf)
}

function toBase64(bytes: Uint8Array): string {
  const CHUNK = 8192
  let out = ''
  for (let o = 0; o < bytes.length; o += CHUNK) out += String.fromCharCode(...bytes.subarray(o, o + CHUNK))
  return btoa(out)
}

const DINERO_ASSET = require('../../assets/sounds/dinero.mp3')

// ── Public ────────────────────────────────────────────────────────────────────

export async function playCelebrationSound(area: ManifestationArea): Promise<void> {
  if (area === 'dinero') {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy) } catch {}
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false })
      const { sound } = await Audio.Sound.createAsync(DINERO_ASSET, { shouldPlay: true, volume: 1 })
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync().catch(() => {})
      })
    } catch {}
    return
  }

  // Haptic first — instant feedback while WAV buffer builds
  try {
    if (area === 'amor' || area === 'felicidad') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  } catch {}

  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false })
    const wav = buildWav(AREA_TONES[area])
    const uri = `${FileSystem.cacheDirectory}celeb_${area}.wav`
    await FileSystem.writeAsStringAsync(uri, toBase64(wav), { encoding: 'base64' as any })
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 1 })
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) sound.unloadAsync().catch(() => {})
    })
  } catch {}
}
