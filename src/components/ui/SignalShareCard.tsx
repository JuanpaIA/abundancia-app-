// Off-screen card captured by react-native-view-shot to produce the share image.
// Rendered at 360×640 (1/3 of the 1080×1920 canvas spec).
// view-shot captures at device pixel ratio → ~1080×1920 on 3x devices.
// LUMINA wordmark is always shown here — branding is the point.

import React, { forwardRef } from 'react'
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle, Line, Rect, Defs, ClipPath } from 'react-native-svg'
import type { SignalResult } from '@lumina/core'
import { Fonts } from '../../constants/theme'

// Base canvas: 1080×1920. Render at 1/3 scale: 360×640.
export const CARD_W = 360
export const CARD_H = 640
const S = CARD_W / 1080

// Moon — mirrors canvas: CX=540, CY=440, R=190
const MOON_CX = Math.round(540 * S)     // 180
const MOON_CY = Math.round(440 * S)     // 147
const MOON_R  = Math.round(190 * S)     // 63

const TIER_COLOR: Record<string, string> = {
  action:    '#eccb7a',
  building:  '#c4aff7',
  reception: '#c8d6ec',
}

// Vertical positions matching canvas coordinates × S
const NUM_BASELINE  = Math.round(900  * S)            // 300
const READING_TOP   = Math.round(970  * S)            // 323
const DIVIDER_Y     = Math.round(1780 * S)            // 593
const WM_BOTTOM     = Math.round((1920 - 1848) * S)   // 24
const DOMAIN_BOTTOM = Math.round((1920 - 1896) * S)   // 8

// Font sizes matching canvas
const SCORE_SIZE    = Math.round(MOON_R * 0.55)       // ~35
const NUM_SIZE_1D   = Math.round(316 * S)             // 105  single digit
const NUM_SIZE_2D   = Math.round(272 * S)             // 91   11, 22, 33
const READING_FS    = Math.round(52 * S)              // 17
const READING_LH    = Math.round(76 * S)              // 25
const READING_MARGIN = Math.round(100 * S)            // 33
const WM_FS         = Math.round(58 * S)              // 19
const DOMAIN_FS     = Math.round(34 * S)              // 11

interface Props {
  signal: SignalResult
  alignmentScore: number
  alignmentTier: string
  style?: StyleProp<ViewStyle>
}

export const SignalShareCard = forwardRef<View, Props>(
  ({ signal, alignmentScore, alignmentTier, style }, ref) => {
    const moonColor = TIER_COLOR[alignmentTier] ?? '#eccb7a'
    const isMaster  = signal.number === 11 || signal.number === 22 || signal.number === 33
    const numSize   = String(signal.number).length > 1 ? NUM_SIZE_2D : NUM_SIZE_1D

    // Moon fill — same formula as canvas
    const fillRatio = Math.max(0, Math.min(1, (alignmentScore - 45) / 53))
    const fillH     = fillRatio * MOON_R * 2

    // Number top: canvas draws at baseline y=900; RN text top ≈ baseline − 85% of size
    const numTop = NUM_BASELINE - Math.round(numSize * 0.85)

    // Particles — same deterministic seed as canvas (48 particles → use 24 here; same visual)
    const seed = signal.number * 137 + alignmentScore * 31
    const particles = Array.from({ length: 24 }, (_, i) => ({
      cx: (((seed * (i + 7) * 1009) % CARD_W) + CARD_W) % CARD_W,
      cy: ((seed * (i + 3) * 1013) % (CARD_H * 0.55)) + CARD_H * 0.04,
      r:  Math.max(0.5, (((seed * i * 7) % 3) + 1) * S),
      op: (0.12 + (((seed * i * 11) % 20) / 100)).toFixed(2),
    }))

    return (
      <View ref={ref} style={[styles.card, style]}>
        <LinearGradient
          colors={['#170c30', '#120a26', '#0a0814']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Particles + moon + divider in SVG layer */}
        <Svg width={CARD_W} height={CARD_H} style={StyleSheet.absoluteFill}>
          <Defs>
            <ClipPath id="mc">
              <Circle cx={MOON_CX} cy={MOON_CY} r={MOON_R} />
            </ClipPath>
          </Defs>

          {particles.map((p, i) => (
            <Circle key={i} cx={p.cx} cy={p.cy} r={p.r}
              fill={`rgba(212,168,67,${p.op})`} />
          ))}

          {/* Moon outline */}
          <Circle cx={MOON_CX} cy={MOON_CY} r={MOON_R - 1}
            fill="none" stroke={moonColor + '55'} strokeWidth={1} />

          {/* Moon fill from bottom */}
          {fillH > 0 && (
            <Rect
              x={MOON_CX - MOON_R}
              y={MOON_CY + MOON_R - fillH}
              width={MOON_R * 2}
              height={fillH}
              fill={moonColor + '38'}
              clipPath="url(#mc)"
            />
          )}

          {/* Waterline */}
          {fillH > 2 && (
            <Line
              x1={MOON_CX - MOON_R} y1={MOON_CY + MOON_R - fillH}
              x2={MOON_CX + MOON_R} y2={MOON_CY + MOON_R - fillH}
              stroke={moonColor + '99'} strokeWidth={1}
              clipPath="url(#mc)"
            />
          )}

          {/* Divider */}
          <Line
            x1={CARD_W / 2 - 24} y1={DIVIDER_Y}
            x2={CARD_W / 2 + 24} y2={DIVIDER_Y}
            stroke="rgba(212,168,67,0.28)" strokeWidth={0.5}
          />
        </Svg>

        {/* Alignment score inside moon */}
        <Text style={[styles.moonScore, {
          top: MOON_CY - SCORE_SIZE * 0.6,
          color: moonColor,
        }]}>
          {alignmentScore}
        </Text>

        {/* Number */}
        <Text style={[styles.number, {
          top: numTop,
          fontSize: numSize,
          textShadowColor: isMaster ? 'rgba(236,203,122,0.55)' : 'rgba(236,203,122,0.28)',
          textShadowRadius: isMaster ? 20 : 10,
        }]}>
          {signal.number}
        </Text>

        {/* Reading — wraps automatically; 12-word reading fits at READING_FS px */}
        <Text style={[styles.reading, { top: READING_TOP }]}>
          "{signal.reading}"
        </Text>

        {/* Wordmark — always visible in shared image */}
        <Text style={styles.wordmark}>LUMINA</Text>
        <Text style={styles.domain}>lumina.app</Text>
      </View>
    )
  }
)

SignalShareCard.displayName = 'SignalShareCard'

const styles = StyleSheet.create({
  card: {
    width:  CARD_W,
    height: CARD_H,
    overflow: 'hidden',
    backgroundColor: '#0a0814',
  },
  moonScore: {
    position: 'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    fontFamily: Fonts.heading,
    fontSize: SCORE_SIZE,
    includeFontPadding: false,
  },
  number: {
    position: 'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    fontFamily: Fonts.heading,
    color: '#eccb7a',
    textShadowOffset: { width: 0, height: 0 },
    includeFontPadding: false,
  },
  reading: {
    position: 'absolute',
    left:  READING_MARGIN,
    right: READING_MARGIN,
    textAlign: 'center',
    fontFamily: Fonts.headingMedium,
    fontSize: READING_FS,
    lineHeight: READING_LH,
    color: 'rgba(240,236,228,0.92)',
  },
  wordmark: {
    position: 'absolute',
    bottom: WM_BOTTOM,
    left: 0, right: 0,
    textAlign: 'center',
    fontFamily: Fonts.heading,
    fontSize: WM_FS,
    color: 'rgba(212,168,67,0.85)',
    letterSpacing: 6,
  },
  domain: {
    position: 'absolute',
    bottom: DOMAIN_BOTTOM,
    left: 0, right: 0,
    textAlign: 'center',
    fontFamily: Fonts.body,
    fontSize: DOMAIN_FS,
    color: 'rgba(212,168,67,0.38)',
  },
})
