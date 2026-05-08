import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useState } from 'react'
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
  'Actualizaciones constantes',
]

export function PlanSelectionScreen({ onSelectPlan }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual')

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>Acceso completo a todo el sistema de manifestación</Text>

        {/* Toggle mensual / anual */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'monthly' && styles.toggleBtnActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>Mensual</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, billing === 'annual' && styles.toggleBtnActive]}
            onPress={() => setBilling('annual')}
          >
            <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextActive]}>Anual</Text>
          </TouchableOpacity>
        </View>

        {/* Cards lado a lado */}
        <View style={styles.cardsRow}>

          {/* Card Mensual */}
          <View style={[styles.card, billing === 'monthly' && styles.cardSelected]}>
            <Text style={styles.planName}>Mensual</Text>
            <Text style={styles.planDesc}>Flexibilidad total</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>$</Text>
              <Text style={styles.priceAmount}>14</Text>
            </View>
            <Text style={styles.pricePeriod}>/mes</Text>

            <View style={styles.divider} />

            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={styles.check}>✦</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={() => onSelectPlan('monthly')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>Comenzar ahora</Text>
            </TouchableOpacity>
          </View>

          {/* Card Anual */}
          <View style={[styles.card, styles.cardAnnual, billing === 'annual' && styles.cardSelected]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Más popular</Text>
            </View>
            <Text style={[styles.planName, { color: Colors.gold }]}>Anual</Text>
            <Text style={styles.planDesc}>41% de descuento</Text>
            <View style={styles.priceRow}>
              <Text style={[styles.priceCurrency, { color: Colors.gold }]}>$</Text>
              <Text style={[styles.priceAmount, { color: Colors.gold }]}>99</Text>
            </View>
            <Text style={styles.pricePeriod}>$8.25/mes · Ahorras $69</Text>

            <View style={[styles.divider, { borderColor: 'rgba(201,168,76,0.3)' }]} />

            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <Text style={[styles.check, { color: Colors.gold }]}>✦</Text>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => onSelectPlan('annual')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>Comenzar ahora</Text>
            </TouchableOpacity>
          </View>

        </View>

        <Text style={styles.legal}>Pago seguro vía Stripe · Cancela cuando quieras</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center' },

  title:    { fontSize: 26, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  toggleBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: Radius.full },
  toggleBtnActive: { backgroundColor: Colors.gold },
  toggleText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  toggleTextActive: { color: Colors.background },

  cardsRow: { flexDirection: 'row', gap: 12, width: '100%', alignItems: 'flex-start' },

  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 4,
  },
  cardAnnual: {
    borderColor: 'rgba(201,168,76,0.4)',
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  cardSelected: { borderWidth: 2 },

  badge: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: { fontSize: 10, color: Colors.background, fontWeight: '700' },

  planName: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
  planDesc: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },

  priceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  priceCurrency: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginTop: 6 },
  priceAmount:   { fontSize: 42, color: Colors.textPrimary, fontWeight: '700', lineHeight: 48 },
  pricePeriod:   { fontSize: 11, color: Colors.textSecondary, marginBottom: 8 },

  divider: { borderTopWidth: 1, borderColor: Colors.border, marginVertical: 10 },

  benefitRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 5 },
  check:       { color: '#4CAF82', fontSize: 10, marginTop: 3 },
  benefitText: { fontSize: 12, color: Colors.textPrimary, flex: 1, lineHeight: 18 },

  btn: { borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  btnPrimary:      { backgroundColor: Colors.gold },
  btnPrimaryText:  { color: Colors.background, fontWeight: '700', fontSize: 14 },
  btnSecondary:    { borderWidth: 1, borderColor: Colors.border },
  btnSecondaryText:{ color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },

  legal: { fontSize: 11, color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.xl },
})
