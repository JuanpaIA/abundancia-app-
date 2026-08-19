import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme'

interface Props {
  completed: number
  total: number
  label?: string
}

export function ProgressRing({ completed, total, label }: Props) {
  const pct = total > 0 ? Math.min(completed / total, 1) : 0
  const displayPct = Math.round(pct * 100)

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label.toUpperCase()}</Text> : null}
      <View style={styles.track}>
        <LinearGradient
          colors={[Colors.purpleAccent, Colors.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { flex: pct }]}
        />
        <View style={[styles.empty, { flex: 1 - pct }]} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.count}>
          {completed}/{total}
        </Text>
        <Text style={styles.pct}>{displayPct}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.textDim,
    letterSpacing: 1.2,
  },
  track: {
    flexDirection: 'row',
    height: 4,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
  empty: {
    backgroundColor: Colors.border,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  count: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pct: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.purpleAccent,
  },
})
