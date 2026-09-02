import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'signal_history'
const MAX_ENTRIES = 30

export interface SignalHistoryEntry {
  date:    string   // YYYY-MM-DD
  number:  number
  area:    string
  reading: string
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
  }
  return SecureStore.getItemAsync(key).catch(() => null)
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value).catch(() => {})
}

export async function loadSignalHistory(): Promise<SignalHistoryEntry[]> {
  try {
    const raw = await getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SignalHistoryEntry[]
  } catch {
    return []
  }
}

export async function appendSignalHistory(entry: SignalHistoryEntry): Promise<void> {
  try {
    const existing = await loadSignalHistory()
    const updated  = [entry, ...existing].slice(0, MAX_ENTRIES)
    await setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}

export async function clearSignalHistory(): Promise<void> {
  await setItem(STORAGE_KEY, '[]')
}
