import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Colors, Radius, Spacing } from '../../constants/theme'

type Variant = 'default' | 'featured' | 'purple'

interface Props {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  goldBorder?: boolean
  variant?: Variant
  entering?: typeof FadeInDown | any   // layout animation — e.g. FadeInDown.delay(120).duration(320)
}

export function Card({ children, style, goldBorder, variant = 'default', entering }: Props) {
  const v = goldBorder ? 'featured' : variant
  return (
    <Animated.View
      entering={entering}
      style={[
        styles.card,
        v === 'featured' && styles.featured,
        v === 'purple'   && styles.purple,
        style,
      ]}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
  },
  featured: {
    borderColor: Colors.borderGold,
    borderWidth: 1,
  },
  purple: {
    borderColor: Colors.borderPurple,
    borderWidth: 1,
  },
})
