import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)' opacity='1'/></svg>`
const NOISE_URI = `data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}`

interface Props {
  children: React.ReactNode
}

export function AppBackground({ children }: Props) {
  return (
    <LinearGradient
      colors={['#16102a', '#0e0b1e', '#0a0814']}
      locations={[0, 0.4, 1]}
      style={styles.root}
    >
      {/* noise texture */}
      <View
        style={styles.noise}
        // @ts-ignore
        aria-hidden
      />
      {/* purple orb top-right */}
      <View
        style={[styles.orb, styles.orbPurple]}
        // @ts-ignore
        aria-hidden
      />
      {/* gold orb bottom-left */}
      <View
        style={[styles.orb, styles.orbGold]}
        // @ts-ignore
        aria-hidden
      />
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    // @ts-ignore
    backgroundImage: `url("${NOISE_URI}")`,
    backgroundRepeat: 'repeat',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    // @ts-ignore
    pointerEvents: 'none',
  },
  orbPurple: {
    width: 320,
    height: 320,
    top: -80,
    right: -80,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 65%)',
  },
  orbGold: {
    width: 260,
    height: 260,
    bottom: 200,
    left: -80,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)',
  },
})
