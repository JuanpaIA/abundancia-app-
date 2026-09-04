import React from 'react'
import { Text, StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../constants/theme'

interface Props {
  children: React.ReactNode
  fontSize: number
  style?: object
}

// Web fallback — plain gold text
export function GradientText({ children, fontSize, style }: Props) {
  return (
    <Text style={[styles.number, { fontSize }, style]}>{children}</Text>
  )
}

const styles = StyleSheet.create({
  number: {
    fontFamily: Fonts.heading,
    color: Colors.goldLight,
    includeFontPadding: false,
    textAlign: 'center',
  },
})
