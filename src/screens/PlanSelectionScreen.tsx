import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { Colors, Spacing, Radius } from '../constants/theme'
import { PlanType } from '../types'

interface Props {
  onSelectPlan: (plan: PlanType) => void
}

const benefits = [
  'Protocolo diario 100% personalizado',
  'Rituales por fase lunar y área de manifestación',
  'Afirmaciones según tu número numerológico',
  'Color y alimentos vibracionales del día',
  'Frecuencias de manifestación con reproductor',
  'Protocolo mañana, tarde y noche',
  'Diario de manifestación',
  'Seguimiento de 9 hábitos diarios',
  'Portales energéticos y fases lunares',
  'Acceso web y móvil',
]

const plans: { type: PlanType; trial: number; price: string; period: string; recommended: boolean }[] = [
  { type: 'monthly', trial: 7, price: '$14.99', period: '/mes', recommended: true },
  { type: 'weekly',  trial: 3, price: '$6.99',  period: '/semana', recommended: false },
]

export function PlanSelectionScreen({ onSelectPlan }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Empieza gratis hoy</Text>
        <Text style={styles.subtitle}>Sin cobros durante el período de prueba · Cancela cuando quieras</Text>

        {plans.map(plan => (
          <View
            key={plan.type}
            style={[styles.card, plan.recommended && styles.cardRecommended]}
          >
            {plan.recommended && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>MÁS POPULAR</Text>
              </View>
            )}

            <View style={styles.trialHero}>
              <Text style={styles.trialDays}>{plan.trial}</Text>
              <Text style={styles.trialLabel}>días gratis</Text>
            </View>

            <Text style={styles.planPrice}>
              {plan.price}<Text style={styles.planPeriod}>{plan.period}</Text>
            </Text>
            <Text style={styles.planAfter}>después del período de prueba gratuita</Text>

            <TouchableOpacity
              style={[styles.btn, plan.recommended ? styles.btnPrimary : styles.btnOutline]}
              onPress={() => onSelectPlan(plan.type)}
              activeOpacity={0.85}
            >
              <Text style={[styles.btnText, !plan.recommended && styles.btnTextOutline]}>
                Comenzar {plan.trial} días gratis
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Todo incluye</Text>
          {benefits.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.check}>✦</Text>
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.legal}>
          Pago seguro vía Stripe · Se cobra al finalizar la prueba{'\n'}
          Cancela en cualquier momento antes sin costo
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center', gap: Spacing.lg },

  title: {
    fontSize: 28, color: Colors.textPrimary, fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 20, marginTop: -Spacing.sm,
  },

  card: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardRecommended: {
    borderColor: Colors.gold,
    borderWidth: 2,
    backgroundColor: 'rgba(201,168,76,0.06)',
  },

  badge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: { color: Colors.background, fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  trialHero: { alignItems: 'center', gap: 0 },
  trialDays: {
    fontSize: 88,
    fontWeight: '700',
    color: Colors.gold,
    lineHeight: 96,
    includeFontPadding: false,
  },
  trialLabel: {
    fontSize: 22,
    color: Colors.gold,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  planPrice: {
    fontSize: 18, color: Colors.textPrimary, fontWeight: '700',
    marginTop: Spacing.sm,
  },
  planPeriod: { fontSize: 14, color: Colors.textSecondary, fontWeight: '400' },
  planAfter:  { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },

  btn: {
    width: '100%', paddingVertical: 14,
    borderRadius: Radius.md, alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnPrimary: { backgroundColor: Colors.gold },
  btnOutline: { borderWidth: 1, borderColor: Colors.gold },
  btnText: { color: Colors.background, fontSize: 15, fontWeight: '700' },
  btnTextOutline: { color: Colors.gold },

  benefitsSection: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: Spacing.lg,
    gap: Spacing.xs,
  },
  benefitsTitle: {
    fontSize: 13, color: Colors.textSecondary, fontWeight: '600',
    textAlign: 'center', marginBottom: Spacing.sm, letterSpacing: 1,
    textTransform: 'uppercase',
  },
  benefitRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  check: { color: Colors.success, fontSize: 10, marginTop: 4 },
  benefitText: { fontSize: 14, color: Colors.textPrimary, flex: 1, lineHeight: 22 },

  legal: {
    fontSize: 11, color: Colors.textDisabled,
    textAlign: 'center', lineHeight: 18,
  },
})
