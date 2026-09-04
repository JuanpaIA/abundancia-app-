import { StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'

export function BlurOverlay() {
  return <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
}
