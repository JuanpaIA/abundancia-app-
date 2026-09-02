import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'

const STORAGE_KEY = 'lumina_app_theme'

export interface AppPalette {
  name: 'rosa' | 'morado'
  label: string
  emoji: string
  hero: string
  accent: string
  accentDim: string
  accentBorder: string
}

export const ROSA: AppPalette = {
  name: 'rosa',
  label: 'Rosa · Pétalo',
  emoji: '🌸',
  hero: '#8C5A6E',
  accent: '#6B3F5A',
  accentDim: 'rgba(107,63,90,0.12)',
  accentBorder: 'rgba(107,63,90,0.15)',
}

export const MORADO: AppPalette = {
  name: 'morado',
  label: 'Morado · Aura',
  emoji: '🔮',
  hero: '#7B5EA8',
  accent: '#5B4096',
  accentDim: 'rgba(91,64,150,0.12)',
  accentBorder: 'rgba(91,64,150,0.15)',
}

export const PALETTES: AppPalette[] = [ROSA, MORADO]

interface ThemeCtx {
  palette: AppPalette
  setTheme: (name: 'rosa' | 'morado') => void
}

const ThemeContext = createContext<ThemeCtx>({ palette: ROSA, setTheme: () => {} })

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<AppPalette>(ROSA)

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then(saved => {
      if (saved === 'morado') setPalette(MORADO)
    })
  }, [])

  const setTheme = useCallback((name: 'rosa' | 'morado') => {
    const next = name === 'morado' ? MORADO : ROSA
    setPalette(next)
    SecureStore.setItemAsync(STORAGE_KEY, name)
  }, [])

  return (
    <ThemeContext.Provider value={{ palette, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
