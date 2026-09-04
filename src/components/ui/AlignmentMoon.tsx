import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Defs, RadialGradient, LinearGradient, ClipPath, Circle, Ellipse, Path, Stop } from 'react-native-svg'
import { Fonts } from '../../constants/theme'

interface AlignmentMoonProps {
  score: number
  tier: string
  size?: number
  showScore?: boolean
}

const TIER: Record<string, { light: string; mid: string; dark: string }> = {
  action:    { light: '#fff4d6', mid: '#eccb7a', dark: '#8a6830' },
  building:  { light: '#ede0ff', mid: '#c4aff7', dark: '#6b40c0' },
  reception: { light: '#ddeeff', mid: '#c8d6ec', dark: '#5577aa' },
}

export function AlignmentMoon({ score, tier, size = 72, showScore = true }: AlignmentMoonProps) {
  const t     = TIER[tier] ?? TIER.action
  const r     = size / 2
  const fill  = Math.max(0, Math.min(1, (score - 45) / 53))
  const halo  = size * 0.20
  const haloR = r + halo           // total radius including halo
  const cx    = haloR              // center in viewport
  const cy    = haloR

  // Terminator ellipse: when fill=0 fully dark side right, fill=1 fully lit
  const termRx = r * Math.abs(Math.cos(Math.PI * fill))
  const termCx = cx - r + 2 * r * fill   // moves left→right as fill increases

  // Unique id suffix to avoid SVG id collisions when multiple moons on screen
  const uid = `${score}_${tier}`

  return (
    <View style={[styles.wrap, { width: haloR * 2, height: haloR * 2 }]}>
      <Svg
        width={haloR * 2}
        height={haloR * 2}
        viewBox={`0 0 ${haloR * 2} ${haloR * 2}`}
      >
        <Defs>
          {/* Soft halo glow */}
          <RadialGradient id={`hl_${uid}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="52%"  stopColor={t.mid} stopOpacity="0" />
            <Stop offset="72%"  stopColor={t.mid} stopOpacity="0.13" />
            <Stop offset="88%"  stopColor={t.mid} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={t.mid} stopOpacity="0" />
          </RadialGradient>

          {/* Sphere lighting — off-center radial, upper-left highlight */}
          <RadialGradient id={`sp_${uid}`} cx="35%" cy="28%" rx="75%" ry="75%">
            <Stop offset="0%"   stopColor={t.light} stopOpacity="1" />
            <Stop offset="40%"  stopColor={t.mid}   stopOpacity="1" />
            <Stop offset="100%" stopColor={t.dark}  stopOpacity="1" />
          </RadialGradient>

          {/* Terminator shadow */}
          <LinearGradient id={`tm_${uid}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"   stopColor="#08060f" stopOpacity="0.96" />
            <Stop offset="50%"  stopColor="#08060f" stopOpacity="0.70" />
            <Stop offset="100%" stopColor="#08060f" stopOpacity="0" />
          </LinearGradient>

          {/* Clip sphere boundary */}
          <ClipPath id={`mc_${uid}`}>
            <Circle cx={cx} cy={cy} r={r - 1} />
          </ClipPath>
        </Defs>

        {/* Halo */}
        <Circle cx={cx} cy={cy} r={haloR} fill={`url(#hl_${uid})`} />

        {/* Sphere base */}
        <Circle cx={cx} cy={cy} r={r - 1} fill={`url(#sp_${uid})`} clipPath={`url(#mc_${uid})`} />

        {/* Mare Tranquillitatis-like patch */}
        <Path
          d={`M ${cx + r * 0.08} ${cy - r * 0.12}
              c ${r * 0.14} ${-r * 0.09} ${r * 0.24} ${-r * 0.03} ${r * 0.18} ${r * 0.14}
              c ${-r * 0.05} ${r * 0.15} ${-r * 0.20} ${r * 0.16} ${-r * 0.23} ${r * 0.06}
              c ${-r * 0.07} ${-r * 0.10} ${-r * 0.05} ${-r * 0.18} ${0.05 * r} ${-r * 0.21} z`}
          fill={t.dark}
          opacity={0.28}
          clipPath={`url(#mc_${uid})`}
        />

        {/* Smaller mare — Oceanus Procellarum hint */}
        <Path
          d={`M ${cx - r * 0.22} ${cy + r * 0.10}
              c ${r * 0.15} ${-r * 0.07} ${r * 0.30} ${r * 0.03} ${r * 0.22} ${r * 0.19}
              c ${-r * 0.07} ${r * 0.11} ${-r * 0.26} ${r * 0.09} ${-r * 0.27} ${-r * 0.05}
              c ${-r * 0.03} ${-r * 0.11} ${0.01 * r} ${-r * 0.09} ${0.05 * r} ${-r * 0.13} z`}
          fill={t.dark}
          opacity={0.20}
          clipPath={`url(#mc_${uid})`}
        />

        {/* Terminator shadow — skip when fully lit */}
        {fill < 0.97 && (
          <Ellipse
            cx={termCx}
            cy={cy}
            rx={Math.max(0.5, termRx)}
            ry={r - 1}
            fill={`url(#tm_${uid})`}
            clipPath={`url(#mc_${uid})`}
          />
        )}

        {/* Limb */}
        <Circle cx={cx} cy={cy} r={r - 1} fill="none" stroke={t.mid} strokeWidth={0.6} opacity={0.25} />
      </Svg>

      {showScore && (
        <View style={[styles.scoreWrap, { width: haloR * 2, height: haloR * 2 }]}>
          <Text style={[styles.score, { color: t.light, fontSize: size * 0.26 }]}>{score}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap:      { position: 'relative' },
  scoreWrap: { position: 'absolute', top: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  score:     { fontFamily: Fonts.headingItalic, letterSpacing: -0.5, includeFontPadding: false },
})
