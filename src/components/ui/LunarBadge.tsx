import { View, Text, StyleSheet } from 'react-native'
import { Svg, Path } from 'react-native-svg'
import { Colors, Fonts, Spacing } from '../../constants/theme'

interface Props {
  phase: string
  subtitle?: string
}

function MoonIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={Colors.gold}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function LunarBadge({ phase, subtitle }: Props) {
  return (
    <View style={styles.pill}>
      <MoonIcon />
      <Text style={styles.phase}>{phase}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.purpleDim,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  phase: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.purpleAccent,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
  },
})
