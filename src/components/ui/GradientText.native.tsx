import React from 'react'
import { Text, StyleSheet } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { Fonts, Colors } from '../../constants/theme'

interface Props {
  children: React.ReactNode
  fontSize: number
  style?: object
}

export function GradientText({ children, fontSize, style }: Props) {
  return (
    <MaskedView
      maskElement={
        <Text style={[styles.number, { fontSize }, style]}>{children}</Text>
      }
    >
      <LinearGradient
        colors={['#fff4d6', '#eccb7a', '#d4a843']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <Text style={[styles.number, { fontSize, color: 'transparent' }, style]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
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
