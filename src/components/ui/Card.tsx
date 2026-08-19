import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Colors, Radius, Spacing } from '../../constants/theme'

interface Props {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  goldBorder?: boolean
}

export function Card({ children, style, goldBorder }: Props) {
  return (
    <View style={[styles.card, goldBorder && styles.goldBorder, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  goldBorder: {
    borderColor: Colors.gold,
    borderWidth: 1,
  },
})
