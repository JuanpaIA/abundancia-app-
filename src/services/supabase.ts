// Web implementation — uses localStorage.
// Metro resolves supabase.native.ts on iOS/Android instead of this file.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Injecting a StorageAdapter instead of hard-coding storage means swapping the
// backend (localStorage → IndexedDB, SecureStore → MMKV) is one-file change.
export type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

const webStorage: StorageAdapter = {
  getItem: async (key) => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key)
  },
  setItem: async (key, value) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(key, value)
  },
  removeItem: async (key) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: webStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
