import { View, Text, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../services/supabase'
import { Colors, Spacing, Radius } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { PlanType } from '../types'

const PRICE_IDS: Record<PlanType, string> = {
  monthly: 'price_1TSSJMP1zGvRRWhKGykXARXa',
  annual:  'price_1TSSK4P1zGvRRWhKcZa0wiAs',
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
      // Esperar 2s para que el webhook actualice la suscripción
      setTimeout(() => handleVerify(), 2000)
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
        Alert.alert('Error', error?.message ?? 'No se pudo iniciar el pago. Intenta de nuevo.')
        return
      }

      await WebBrowser.openBrowserAsync(data.url)
    } catch (e: any) {
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
      setLoadingVerify(false)
      Alert.alert(
        'Pago no confirmado',
        'Aún no detectamos tu pago. Si ya pagaste, espera unos segundos y vuelve a verificar.'
      )
    }
  }

  const isAnnual = planType === 'annual'

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>✦</Text>
        <Text style={styles.title}>Un paso para activar{'\n'}tu sistema</Text>
        <Text style={styles.subtitle}>
          Estás a punto de acceder a tu protocolo diario personalizado.
        </Text>

        <View style={styles.planCard}>
          {isAnnual && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Más popular — 41% descuento</Text>
            </View>
          )}
          <Text style={styles.planPrice}>{isAnnual ? '$99' : '$14'}</Text>
          <Text style={styles.planPeriod}>
            {isAnnual ? '/año · $8.25/mes · Ahorras $69' : '/mes'}
          </Text>
        </View>

        <GradientButton
          title={isAnnual ? 'Pagar $99/año' : 'Pagar $14/mes'}
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
  badge: {
    backgroundColor: Colors.gold, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  badgeText: { color: Colors.background, fontSize: 12, fontWeight: '700' },
  planPrice: { fontSize: 48, color: Colors.gold, fontWeight: '700' },
  planPeriod: { fontSize: 14, color: Colors.textSecondary },
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
