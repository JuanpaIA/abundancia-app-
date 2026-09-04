import { View, Text, StyleSheet } from 'react-native'
import { Colors, Fonts, Spacing } from '../../constants/theme'

type Tone = 'gold' | 'purple' | 'dim'

interface Props {
  children: React.ReactNode
  tone?: Tone
}

const toneColor: Record<Tone, string> = {
  gold:   Colors.gold,
  purple: Colors.purple,
  dim:    Colors.textDim,
}

export function SectionLabel({ children, tone = 'dim' }: Props) {
  const color = toneColor[tone]
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color }]}>{children}</Text>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.08 * 13,
    textTransform: 'uppercase',
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
})
