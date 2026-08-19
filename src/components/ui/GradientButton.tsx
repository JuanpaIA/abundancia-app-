import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, StyleProp } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme'

interface Props {
  title: string
  onPress: () => void
  loading?: boolean
  variant?: 'primary' | 'outline' | 'purple'
  style?: StyleProp<ViewStyle>
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
        colors={[Colors.purpleAccent, '#6d5bdb']}
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

  return (
    <LinearGradient
      colors={[Colors.gold, '#b8882a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradientWrap, style]}
    >
      <TouchableOpacity onPress={onPress} disabled={loading} style={styles.inner}>
        {loading
          ? <ActivityIndicator color={Colors.background} />
          : <Text style={styles.text}>{title}</Text>
        }
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientWrap: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  inner: {
    width: '100%',
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.background,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  outline: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
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
