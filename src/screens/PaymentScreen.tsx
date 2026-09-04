import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform, ScrollView } from 'react-native'
import { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../services/supabase'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { GradientButton } from '../components/ui/GradientButton'
import { PlanType } from '@lumina/core'

const PRICE_IDS: Record<PlanType, string> = {
  monthly: 'price_1TSSJMP1zGvRRWhKGykXARXa',
  weekly:  'WEEKLY_PRICE_ID_PENDIENTE',       // reemplazar con el Price ID de Stripe
}

const TRIAL_DAYS: Record<PlanType, number> = {
  monthly: 7,
  weekly:  3,
}

interface Props {
  userId: string
  email: string
  selectedPlan: PlanType
  onSelectPlan: (plan: PlanType) => void
  onPaymentSuccess: () => void
  onSignOut: () => void
}

export function PaymentScreen({ userId, email, selectedPlan, onSelectPlan, onPaymentSuccess, onSignOut }: Props) {
  const planType = selectedPlan
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [loadingVerify, setLoadingVerify] = useState(false)

  // En web: si Stripe redirigió con ?payment=success, verificar automáticamente
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', window.location.pathname)
      const t = setTimeout(() => handleVerify(), 2000)
      return () => clearTimeout(t)
    }
  }, [])

  async function handleCheckout() {
    setLoadingCheckout(true)
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: PRICE_IDS[planType],
          userId,
          email,
          planType,
        },
      })

      if (error || !data?.url) {
        const msg = error?.message ?? 'No se pudo iniciar el pago. Intenta de nuevo.'
        void supabase.from('error_reports').insert({
          user_id: userId,
          section: 'payment',
          error_message: msg,
          app_context: { action: 'create_checkout', plan_type: planType },
        })
        Alert.alert('Error', msg)
        return
      }

      await WebBrowser.openBrowserAsync(data.url)
    } catch (e: any) {
      void supabase.from('error_reports').insert({
        user_id: userId,
        section: 'payment',
        error_message: e.message,
        app_context: { action: 'create_checkout_exception', plan_type: planType },
      })
      Alert.alert('Error', e.message)
    } finally {
      setLoadingCheckout(false)
    }
  }

  async function handleVerify() {
    setLoadingVerify(true)
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', userId)
      .single()

    if (data?.subscription_status === 'active') {
      const today = new Date().toISOString().split('T')[0]
      await supabase.from('profiles')
        .update({ plan_start_date: today })
        .eq('id', userId)
      setLoadingVerify(false)
      onPaymentSuccess()
    } else {
      void supabase.from('error_reports').insert({
        user_id: userId,
        section: 'payment',
        error_message: 'Verificación de pago fallida — subscription_status no es active',
        app_context: { action: 'verify_payment', plan_type: planType },
      })
      setLoadingVerify(false)
      Alert.alert(
        'Pago no confirmado',
        'Aún no detectamos tu pago. Si ya pagaste, espera unos segundos y vuelve a verificar.'
      )
    }
  }

  const trialDays = TRIAL_DAYS[planType]

  const plans: { type: PlanType; trial: number; price: string; period: string }[] = [
    { type: 'monthly', trial: 7, price: '$14.99', period: '/mes' },
    { type: 'weekly',  trial: 3, price: '$6.99',  period: '/semana' },
  ]

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.emoji}>✦</Text>
        <Text style={styles.title}>Elige tu plan</Text>
        <Text style={styles.subtitle}>Sin cobros durante la prueba · Cancela cuando quieras</Text>

        {/* Selector de plan */}
        <View style={styles.planSelector}>
          {plans.map(p => (
            <TouchableOpacity
              key={p.type}
              style={[styles.planOption, planType === p.type && styles.planOptionSelected]}
              onPress={() => onSelectPlan(p.type)}
              activeOpacity={0.85}
            >
              <Text style={[styles.planTrialNum, planType === p.type && styles.planTrialNumActive]}>
                {p.trial}
              </Text>
              <Text style={[styles.planTrialLabel, planType === p.type && styles.planTrialLabelActive]}>
                días gratis
              </Text>
              <Text style={styles.planPriceSmall}>
                {p.price}<Text style={styles.planPeriod}>{p.period}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Testimonios */}
        <View style={styles.testimonials}>
          {[
            { quote: '"En 2 semanas noté diferencia en mi energía y mis ingresos. El protocolo me dio claridad."', name: 'Valentina M.', area: 'Dinero y Prosperidad' },
            { quote: '"El ritual de la mañana me cambió la perspectiva completamente. Nunca pensé que algo tan simple funcionara."', name: 'Carolina R.', area: 'Propósito de Vida' },
            { quote: '"Llevaba meses bloqueada. Con Luumina en 3 semanas manifesté algo que llevaba 2 años buscando."', name: 'Daniela L.', area: 'Amor y Relaciones' },
          ].map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <Text style={styles.testimonialStars}>⭐⭐⭐⭐⭐</Text>
              <Text style={styles.testimonialQuote}>{t.quote}</Text>
              <Text style={styles.testimonialName}>{t.name} · {t.area}</Text>
            </View>
          ))}
        </View>

        <GradientButton
          title={`Empezar ${trialDays} días gratis`}
          onPress={handleCheckout}
          loading={loadingCheckout}
        />

        <GradientButton
          title="Ya pagué — Verificar acceso"
          onPress={handleVerify}
          loading={loadingVerify}
        />

        <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Pago seguro vía Stripe · Se cobra al finalizar la prueba.{'\n'}
          Serás redirigido a Stripe para completar el pago.
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 100, gap: Spacing.md },
  emoji: { fontSize: 40, textAlign: 'center', color: Colors.gold },
  title: {
    fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold,
    textAlign: 'center', lineHeight: 34,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  planSelector: { flexDirection: 'row', gap: 12 },
  planOption: {
    flex: 1, backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, alignItems: 'center', gap: 2,
  },
  planOptionSelected: { borderColor: Colors.gold, borderWidth: 2, backgroundColor: Colors.goldDim },
  planTrialNum: { fontSize: 52, fontWeight: '700', color: Colors.textSecondary, lineHeight: 58, includeFontPadding: false },
  planTrialNumActive: { color: Colors.gold },
  planTrialLabel: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  planTrialLabelActive: { color: Colors.gold },
  planPriceSmall: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  planPeriod: { fontSize: 11, color: Colors.textDisabled, fontWeight: '400' },
  legal: {
    fontSize: 11, color: Colors.textDisabled,
    textAlign: 'center', lineHeight: 18, marginTop: Spacing.sm,
  },
  testimonials: { gap: Spacing.sm },
  testimonialCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: 6,
  },
  testimonialStars: { fontSize: 12 },
  testimonialQuote: {
    fontSize: 13, color: Colors.textPrimary,
    lineHeight: 20, fontStyle: 'italic',
  },
  testimonialName: { fontSize: 12, color: Colors.gold, fontWeight: '600' },

  signOutBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  signOutText: { fontSize: 13, color: Colors.textDisabled },
})
