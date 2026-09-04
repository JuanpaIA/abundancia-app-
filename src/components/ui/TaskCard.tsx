import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Colors, Fonts, Spacing } from '../../constants/theme'

type Accent = 'gold' | 'purple'

interface Props {
  label?: string
  title: string
  body?: string
  accent?: Accent
  done?: boolean
  onDone?: () => void
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export function TaskCard({ label, title, body, accent = 'purple', done, onDone, style, children }: Props) {
  return (
    <TouchableOpacity
      style={[styles.row, style]}
      onPress={!done ? onDone : undefined}
      activeOpacity={done ? 1 : 0.7}
    >
      {/* Círculo de completado */}
      <View style={[styles.circle, done && styles.circleActive]}>
        {done && <View style={styles.checkMark} />}
      </View>

      {/* Cuerpo de texto */}
      <View style={styles.body}>
        {label ? (
          <Text style={styles.label}>{label.toUpperCase()}</Text>
        ) : null}
        <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
          {title}
        </Text>
        {body ? (
          <Text style={styles.hint}>{body}</Text>
        ) : null}
        {children}
      </View>

      {/* Acción derecha */}
      {!done && onDone ? (
        <Text style={styles.action}>Abrir</Text>
      ) : null}
      {done ? (
        <Text style={styles.doneGlyph}>✦</Text>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(240,236,228,0.08)',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.35)',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  checkMark: {
    width: 8,
    height: 5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: Colors.background,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.gold,
    opacity: 0.65,
    marginBottom: 1,
  },
  title: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    opacity: 0.7,
  },
  action: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.gold,
    opacity: 0.65,
    flexShrink: 0,
  },
  doneGlyph: {
    fontSize: 12,
    color: Colors.gold,
    opacity: 0.45,
    flexShrink: 0,
  },
})
