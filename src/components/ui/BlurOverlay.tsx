import { View, StyleSheet } from 'react-native'

// Web fallback — no native blur, background handles opacity
export function BlurOverlay() {
  return <View style={StyleSheet.absoluteFill} />
}
