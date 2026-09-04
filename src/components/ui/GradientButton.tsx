import { useEffect } from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme'

const SCREEN_W = Dimensions.get('window').width

interface Props {
  title: string
  onPress: () => void
  loading?: boolean
  variant?: 'primary' | 'outline' | 'purple'
  style?: StyleProp<ViewStyle>
}

function GoldShimmer() {
  const shimmerX = useSharedValue(-120)

  useEffect(() => {
    shimmerX.value = withRepeat(
      withSequence(
        withDelay(
          3200,
          withTiming(SCREEN_W + 80, { duration: 750, easing: Easing.out(Easing.quad) })
        ),
        withTiming(-120, { duration: 0 })
      ),
      -1,
      false
    )
  }, [])

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }))

  return (
    <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
  )
}

export function GradientButton({ title, onPress, loading, variant = 'primary', style }: Props) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity style={[styles.outline, style]} onPress={onPress} disabled={loading}>
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    )
  }

  if (variant === 'purple') {
    return (
      <LinearGradient
        colors={[Colors.purple, Colors.purpleSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientWrap, style]}
      >
        <TouchableOpacity onPress={onPress} disabled={loading} style={styles.inner}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[styles.text, { color: '#fff' }]}>{title}</Text>
          }
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  // Primary — metallic gold
  return (
    <LinearGradient
      colors={['#f5dfa0', '#eccb7a', '#d4a843', '#b8912f']}
      locations={[0, 0.35, 0.65, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientWrap, styles.goldShadow, style]}
    >
      {/* Canto superior iluminado */}
      <Animated.View style={styles.goldEdge} pointerEvents="none" />

      <TouchableOpacity onPress={onPress} disabled={loading} style={styles.inner}>
        {loading
          ? <ActivityIndicator color="#241a05" />
          : <Text style={styles.text}>{title}</Text>
        }
      </TouchableOpacity>

      {/* Shimmer band — only when not loading */}
      {!loading && <GoldShimmer />}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientWrap: {
    width: '100%',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  goldShadow: {
    shadowColor: '#d4a843',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40,
    shadowRadius: 20,
    elevation: 8,
  },
  goldEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    zIndex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ rotate: '15deg' }],
  },
  inner: {
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    color: '#241a05',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  outline: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
  },
  outlineText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
    fontSize: 16,
  },
})
