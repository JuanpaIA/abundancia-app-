// Native implementation — SecureStore (encrypted keychain/keystore).
// Swap to MMKV or another adapter here when needed — callers never change.

import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import type { StorageAdapter } from './supabase'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

const nativeStorage: StorageAdapter = {
  getItem:    (key) => SecureStore.getItemAsync(key),
  setItem:    (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: nativeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
