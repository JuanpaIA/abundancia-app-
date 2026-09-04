import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { GradientButton } from '../components/ui/GradientButton'
import { Colors, Fonts, Spacing, Radius } from '../constants/theme'

interface Props {
  userName?: string
  onSignIn: () => void
  onExplore: () => void
}

export function SignedOutScreen({ userName, onSignIn, onExplore }: Props) {
  const first = userName?.split(' ')[0]
  return (
    <View style={s.container}>
      <ScreenBackground />
      <View style={s.center}>
        <Text style={s.wordmark}>LUUMINA</Text>
        <Text style={s.symbol}>✦</Text>
        <Text style={s.title}>
          {first ? `Hasta pronto,\n${first}` : 'Hasta pronto'}
        </Text>
        <Text style={s.sub}>Tu protocolo te espera cuando vuelvas.</Text>
        <View style={s.actions}>
          <GradientButton title="Volver a entrar" onPress={onSignIn} />
          <TouchableOpacity onPress={onExplore} style={s.exploreBtn}>
            <Text style={s.exploreText}>Explorar Luumina</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
    width: '100%',
  },
  wordmark: {
    fontFamily: Fonts.heading,
    fontSize: 38,
    color: Colors.goldLight,
    letterSpacing: 10,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  symbol: {
    fontSize: 24,
    color: Colors.gold,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.headingItalic,
    fontSize: 40,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 48,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.md,
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  exploreBtn: {
    paddingVertical: Spacing.sm,
  },
  exploreText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textDim,
    letterSpacing: 0.3,
  },
})
