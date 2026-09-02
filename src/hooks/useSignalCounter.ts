import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'signal_counter'
const MAX         = 3

interface Stored { date: string; count: number }

function localDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function read(): Promise<Stored> {
  try {
    const raw = Platform.OS === 'web'
      ? (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
      : await SecureStore.getItemAsync(STORAGE_KEY).catch(() => null)
    if (!raw) return { date: localDate(), count: 0 }
    const stored: Stored = JSON.parse(raw)
    return stored.date === localDate() ? stored : { date: localDate(), count: 0 }
  } catch {
    return { date: localDate(), count: 0 }
  }
}

async function write(s: Stored): Promise<void> {
  const raw = JSON.stringify(s)
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, raw)
  } else {
    await SecureStore.setItemAsync(STORAGE_KEY, raw).catch(() => {})
  }
}

// Standalone reset — callable from DEV panel without needing the hook
export async function resetSignalCounter(): Promise<void> {
  await write({ date: localDate(), count: 0 })
}

export interface SignalCounter {
  remaining:    number   // 0-3
  requestIndex: number   // 0, 1, or 2 (which slot to use for calculateSignal)
  canRequest:   boolean
  increment:    () => Promise<void>
  reset:        () => Promise<void>
}

export function useSignalCounter(refreshKey?: number): SignalCounter {
  const [count,  setCount]  = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    read().then(s => { setCount(s.count); setLoaded(true) })
  }, [refreshKey])  // refreshKey forces re-read when DEV panel resets

  const increment = useCallback(async () => {
    const next = Math.min(count + 1, MAX)
    setCount(next)
    await write({ date: localDate(), count: next })
  }, [count])

  const reset = useCallback(async () => {
    setCount(0)
    await write({ date: localDate(), count: 0 })
  }, [])

  const remaining = loaded ? MAX - count : MAX
  return {
    remaining,
    requestIndex: count,     // first press → index 0, second → 1, third → 2
    canRequest:   remaining > 0,
    increment,
    reset,
  }
}
