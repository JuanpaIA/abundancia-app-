import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Colors, Radius, Spacing } from '../../constants/theme'

interface Props {
  title: string
  onPress: () => void
  loading?: boolean
  variant?: 'primary' | 'outline'
}

export function GradientButton({ title, onPress, loading, variant = 'primary' }: Props) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity style={styles.outline} onPress={onPress} disabled={loading}>
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={styles.button}>
      {loading
        ? <ActivityIndicator color={Colors.background} />
        : <Text style={styles.text}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.gold,
  },
  text: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outline: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gold,
    alignItems: 'center',
  },
  outlineText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '600',
  },
})
