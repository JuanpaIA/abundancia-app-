import { useState, useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const NetInfo = require('@react-native-community/netinfo').default

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      setIsConnected(state.isConnected ?? true)
    })
    return unsubscribe
  }, [])

  return { isConnected }
}
