import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Defs, ClipPath, Circle, Rect } from 'react-native-svg'
import { Fonts } from '../../constants/theme'

interface AlignmentMoonProps {
  score: number
  tier: string
  size?: number
}

const TIER_COLOR: Record<string, string> = {
  action:    '#eccb7a',
  building:  '#c4aff7',
  reception: '#c8d6ec',
}

export function AlignmentMoon({ score, tier, size = 72 }: AlignmentMoonProps) {
  const color  = TIER_COLOR[tier] ?? '#eccb7a'
  const r      = size / 2
  // Fill ratio: score 45→98 maps to fill 0→1
  const fill   = Math.max(0, Math.min(1, (score - 45) / 53))
  const fillH  = fill * size

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <ClipPath id="moonClip">
            <Circle cx={r} cy={r} r={r - 2} />
          </ClipPath>
        </Defs>

        {/* Moon outline */}
        <Circle
          cx={r} cy={r} r={r - 2}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.4}
        />

        {/* Fill from bottom */}
        <Rect
          x={0}
          y={size - fillH}
          width={size}
          height={fillH}
          fill={color}
          opacity={0.22}
          clipPath="url(#moonClip)"
        />

        {/* Fill line at top of fill */}
        {fillH > 2 && (
          <Rect
            x={0}
            y={size - fillH}
            width={size}
            height={1.5}
            fill={color}
            opacity={0.6}
            clipPath="url(#moonClip)"
          />
        )}
      </Svg>

      {/* Score overlay */}
      <View style={[styles.scoreWrap, { width: size, height: size }]}>
        <Text style={[styles.score, { color, fontSize: size * 0.28 }]}>{score}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  scoreWrap: {
    position: 'absolute',
    top: 0, left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontFamily: Fonts.headingItalic,
    letterSpacing: -0.5,
  },
})
