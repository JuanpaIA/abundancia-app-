import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useFrequencyPlayerContext } from '../../contexts/FrequencyPlayerContext'
import { Colors, Fonts, Spacing } from '../../constants/theme'

export function MiniPlayer() {
  const { playing, activeHz, activeLabel, stop, toggle } = useFrequencyPlayerContext()
  const router = useRouter()

  if (Platform.OS === 'web' || !playing || activeHz === null) return null

  function handlePauseResume() {
    if (activeHz !== null && activeLabel !== null) {
      toggle(activeHz, activeLabel)
    }
  }

  function handleTap() {
    router.push('/sonido' as any)
  }

  return (
    <TouchableOpacity style={styles.bar} onPress={handleTap} activeOpacity={0.85}>
      <View style={styles.info}>
        <Text style={styles.hz} numberOfLines={1}>{activeHz} Hz</Text>
        <Text style={styles.label} numberOfLines={1}>{activeLabel}</Text>
      </View>
      <View style={styles.waveContainer}>
        {[4, 7, 5, 9, 6, 8, 4].map((h, i) => (
          <View key={i} style={[styles.wave, { height: h * 2 }]} />
        ))}
      </View>
      <TouchableOpacity style={styles.btn} onPress={handlePauseResume} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.btnIcon}>⏹</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    backgroundColor: Colors.plum,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.plumLight,
  },
  info: { flex: 1, gap: 1 },
  hz: {
    fontSize: 11,
    color: Colors.goldLight,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Fonts.bodyMedium,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    opacity: 0.6,
  },
  wave: {
    width: 2,
    borderRadius: 1,
    backgroundColor: Colors.goldLight,
  },
  btn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.80)',
  },
})
