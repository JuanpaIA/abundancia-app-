import React, { createContext, useContext, useState } from 'react'
import { useFrequencyPlayer } from '../hooks/useFrequencyPlayer'

const MINI_PLAYER_HEIGHT = 48

type FrequencyPlayerCtx = {
  playing: boolean
  activeHz: number | null
  activeLabel: string | null
  miniPlayerHeight: number
  toggle: (hz: number, label: string) => Promise<void>
  stop: () => Promise<void>
}

const FrequencyPlayerContext = createContext<FrequencyPlayerCtx>({
  playing: false,
  activeHz: null,
  activeLabel: null,
  miniPlayerHeight: MINI_PLAYER_HEIGHT,
  toggle: async () => {},
  stop: async () => {},
})

export function FrequencyPlayerProvider({ children }: { children: React.ReactNode }) {
  const { playing, play: rawPlay, stop: rawStop } = useFrequencyPlayer()
  const [activeHz,    setActiveHz]    = useState<number | null>(null)
  const [activeLabel, setActiveLabel] = useState<string | null>(null)

  async function toggle(hz: number, label: string) {
    try {
      if (playing && activeHz === hz) {
        await rawStop()
        setActiveHz(null)
        setActiveLabel(null)
      } else if (playing) {
        // Stop current, then start new (playingRef is false after rawStop so rawPlay will start)
        await rawStop()
        setActiveHz(hz)
        setActiveLabel(label)
        await rawPlay(hz)
      } else {
        setActiveHz(hz)
        setActiveLabel(label)
        await rawPlay(hz)
      }
    } catch {
      setActiveHz(null)
      setActiveLabel(null)
    }
  }

  async function stop() {
    await rawStop()
    setActiveHz(null)
    setActiveLabel(null)
  }

  return (
    <FrequencyPlayerContext.Provider value={{ playing, activeHz, activeLabel, miniPlayerHeight: MINI_PLAYER_HEIGHT, toggle, stop }}>
      {children}
    </FrequencyPlayerContext.Provider>
  )
}

export const useFrequencyPlayerContext = () => useContext(FrequencyPlayerContext)
