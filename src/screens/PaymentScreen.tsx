import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../services/supabase'
import { Colors, Spacing, Radius } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { PlanType } from '../types'

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
  planType: PlanType
  onPaymentSuccess: () => void
  onChangePlan: () => void
  onSignOut: () => void
}

export function PaymentScreen({ userId, email, planType, onPaymentSuccess, onChangePlan, onSignOut }: Props) {
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

  const isWeekly = planType === 'weekly'
  const trialDays = TRIAL_DAYS[planType]

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✦</Text>
        <Text style={styles.title}>Activa tu período{'\n'}de prueba gratis</Text>
        <Text style={styles.subtitle}>
          Sin cobros durante los {trialDays} días de prueba. Cancela cuando quieras.
        </Text>

        <View style={styles.planCard}>
          <Text style={styles.trialBig}>{trialDays}</Text>
          <Text style={styles.trialLabel}>días gratis</Text>
          <Text style={styles.planPrice}>
            {isWeekly ? 'Luego $6.99/semana' : 'Luego $14.99/mes'}
          </Text>
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

        <Text style={styles.changePlan} onPress={onChangePlan}>
          Cambiar plan
        </Text>

        <TouchableOpacity onPress={onSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          Pago seguro vía Stripe · Cancela cuando quieras.{'\n'}
          Serás redirigido a una página externa para completar el pago.
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.md },
  emoji: { fontSize: 40, textAlign: 'center', color: Colors.gold },
  title: {
    fontSize: 26, color: Colors.textPrimary, fontWeight: '700',
    textAlign: 'center', lineHeight: 34,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  planCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.lg, borderWidth: 2, borderColor: Colors.gold,
    alignItems: 'center', gap: 4, marginVertical: Spacing.sm,
  },
  trialBig: {
    fontSize: 72, color: Colors.gold, fontWeight: '700',
    lineHeight: 80, includeFontPadding: false,
  },
  trialLabel: { fontSize: 20, color: Colors.gold, fontWeight: '600' },
  planPrice: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
  changePlan: {
    color: Colors.textSecondary, fontSize: 13,
    textAlign: 'center', textDecorationLine: 'underline',
  },
  legal: {
    fontSize: 11, color: Colors.textDisabled,
    textAlign: 'center', lineHeight: 18, marginTop: Spacing.sm,
  },
  signOutBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  signOutText: { fontSize: 13, color: Colors.textDisabled },
})
