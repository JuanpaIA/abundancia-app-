import { StyleSheet, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg'

const { width: W, height: H } = Dimensions.get('window')

export function ScreenBackground() {
  return (
    <>
      {/* Main dark gradient — deeper violet to near-black */}
      {/* 4-stop gradient: vivid violet → deep indigo → near-black → true black */}
      <LinearGradient
        colors={['#3c1a7c', '#18083a', '#08031a', '#010007']}
        locations={[0, 0.30, 0.65, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Purple moonlight glow at hero area */}
      <Svg
        width={W}
        height={H * 0.60}
        style={styles.glow}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="heroGlow" cx="50%" cy="0%" rx="72%" ry="58%" fx="50%" fy="0%">
            <Stop offset="0%" stopColor="#a166f0" stopOpacity="0.28" />
            <Stop offset="55%" stopColor="#7b3fd4" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#9b5de5" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={W} height={H * 0.60} fill="url(#heroGlow)" />
      </Svg>
    </>
  )
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
})
