import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../contexts/ThemeContext'

const GRADIENTS: Record<'rosa' | 'morado', [string, string, string]> = {
  rosa:   ['#F7E9EE', '#F2E4EC', '#EDE6F2'],
  morado: ['#EFE9F7', '#EBE6F2', '#F2E9EE'],
}

export function ScreenBackground() {
  const { palette } = useTheme()
  return (
    <LinearGradient
      colors={GRADIENTS[palette.name]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    />
  )
}
