import { View, Text, StyleSheet } from 'react-native'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus()
  if (isConnected) return null

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Sin conexión — revisando la red…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#6B3F5A',
    paddingTop: 52,
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
