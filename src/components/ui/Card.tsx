import { StyleSheet, ViewStyle, StyleProp } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Colors, Radius, Spacing } from '../../constants/theme'

type Variant = 'default' | 'featured' | 'purple'

interface Props {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  goldBorder?: boolean
  variant?: Variant
  entering?: typeof FadeInDown | any
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
    backgroundColor: Colors.surface1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  featured: {
    borderColor: Colors.borderGold,
  },
  purple: {
    borderColor: 'rgba(155,93,229,0.28)',
    shadowColor: '#9b5de5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 4,
  },
})
