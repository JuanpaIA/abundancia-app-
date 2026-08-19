import { Text, StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../constants/theme'

type Tone = 'gold' | 'purple' | 'dim'

interface Props {
  children: React.ReactNode
  tone?: Tone
}

const toneColor: Record<Tone, string> = {
  gold: Colors.gold,
  purple: Colors.purpleAccent,
  dim: Colors.textDim,
}

export function SectionLabel({ children, tone = 'dim' }: Props) {
  return (
    <Text style={[styles.label, { color: toneColor[tone] }]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
})
