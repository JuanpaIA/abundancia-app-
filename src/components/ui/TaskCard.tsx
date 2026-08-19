import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Colors, Fonts, Radius, Spacing } from '../../constants/theme'

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

const accentColor: Record<Accent, string> = {
  gold: Colors.gold,
  purple: Colors.purpleAccent,
}

export function TaskCard({ label, title, body, accent = 'purple', done, onDone, style, children }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.stripe, { backgroundColor: accentColor[accent] }]} />
      <View style={styles.content}>
        {label ? (
          <Text style={[styles.label, { color: accentColor[accent] }]}>{label.toUpperCase()}</Text>
        ) : null}
        <View style={styles.row}>
          <Text style={[styles.title, done && styles.titleDone]} numberOfLines={2}>
            {title}
          </Text>
          {onDone ? (
            <TouchableOpacity onPress={onDone} style={[styles.doneBtn, done && styles.doneBtnDone]}>
              <Text style={styles.doneBtnText}>{done ? 'HECHO' : 'MARCAR'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  stripe: {
    width: 3,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  titleDone: {
    opacity: 0.45,
    textDecorationLine: 'line-through',
  },
  body: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: Colors.purpleDim,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  doneBtnDone: {
    backgroundColor: Colors.goldDim,
  },
  doneBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.purpleAccent,
    letterSpacing: 0.6,
  },
})
