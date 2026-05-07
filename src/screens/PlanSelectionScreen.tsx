import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Colors, Spacing, Radius } from '../constants/theme'
import { PlanType } from '../types'

interface Props {
  onSelectPlan: (plan: PlanType) => void
}

const benefits = [
  'Dashboard diario personalizado',
  'Ritual del día según tu ciclo lunar',
  'Afirmaciones por tu número numerológico',
  'Color y alimentos del día',
  'Estrategia biohack diaria',
  'Protocolo mañana, tarde y noche',
  'Reproductor de frecuencias',
  'Rastreador de hábitos',
  'Calendario lunar completo',
  'Rueda de abundancia',
  'Mis intenciones',
]

export function PlanSelectionScreen({ onSelectPlan }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>Acceso completo a todo el sistema</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectPlan('annual')}
          activeOpacity={0.8}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Más popular — 41% descuento</Text>
          </View>
          <Text style={styles.price}>$99</Text>
          <Text style={styles.period}>/año · $8.25/mes</Text>
          <Text style={styles.saving}>Ahorras $69 vs mensual</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardMonthly]}
          onPress={() => onSelectPlan('monthly')}
          activeOpacity={0.8}
        >
          <Text style={styles.priceMonthly}>$14</Text>
          <Text style={styles.period}>/mes</Text>
        </TouchableOpacity>

        <View style={styles.benefits}>
          <Text style={styles.benefitsTitle}>Todo incluido en ambos planes</Text>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.check}>✦</Text>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legal}>
          Pago seguro. Cancela cuando quieras.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  title: { fontSize: 28, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.xs },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  cardMonthly: { borderColor: Colors.border, borderWidth: 1 },
  badge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  badgeText: { color: Colors.background, fontSize: 12, fontWeight: '700' },
  price: { fontSize: 48, color: Colors.gold, fontWeight: '700' },
  priceMonthly: { fontSize: 48, color: Colors.textPrimary, fontWeight: '700' },
  period: { fontSize: 16, color: Colors.textSecondary, marginTop: -4 },
  saving: { fontSize: 13, color: Colors.success, marginTop: Spacing.xs },
  benefits: { marginVertical: Spacing.xl },
  benefitsTitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: Spacing.md },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  check: { color: Colors.gold, fontSize: 12 },
  benefitText: { fontSize: 15, color: Colors.textPrimary },
  legal: { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.md, marginBottom: Spacing.xl },
})
