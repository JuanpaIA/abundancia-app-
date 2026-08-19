import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../src/services/supabase'
import { useAuth } from '../src/hooks/useAuth'
import { LandingScreen } from '../src/screens/LandingScreen'
import { AuthScreen } from '../src/screens/AuthScreen'
import { QuickOnboardingScreen } from '../src/screens/QuickOnboardingScreen'
import { OnboardingScreen } from '../src/screens/OnboardingScreen'
import { DashboardScreen } from '../src/screens/DashboardScreen'
import { PaymentScreen } from '../src/screens/PaymentScreen'
import { ProtocolPreviewScreen } from '../src/screens/ProtocolPreviewScreen'
import { ResetPasswordScreen } from '../src/screens/ResetPasswordScreen'
import { Colors } from '../src/constants/theme'
import { OnboardingData, PlanType } from '../src/types'

type FlowStep = 'landing' | 'quick-onboarding' | 'preview' | 'register' | 'login'

export default function Index() {
  const { session, profile, loading, refreshProfile, resetPasswordMode, clearResetMode } = useAuth()

  const [flowStep, setFlowStep] = useState<FlowStep>('landing')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [savingProfile, setSavingProfile] = useState(false)

  // Cuando el usuario se registra con datos de onboarding locales, auto-guardamos el perfil
  useEffect(() => {
    if (!session || !profile || profile.full_name || !onboardingData || savingProfile) return
    setSavingProfile(true)
    const today = new Date().toISOString().split('T')[0]
    supabase.from('profiles').update({
      full_name: onboardingData.name,
      birth_date: onboardingData.birthDate,
      zodiac_sign: onboardingData.zodiac,
      numerology_number: onboardingData.numerology,
      base_frequency: onboardingData.frequency,
      manifestation_area: onboardingData.manifestationArea,
      goal_details: {},
      plan_duration: 30,
      plan_start_date: today,
    }).eq('id', session.user.id).then(({ error }) => {
      if (!error) refreshProfile()
      setSavingProfile(false)
    })
  }, [session?.user.id, profile?.full_name])

  // Recuperación de contraseña — máxima prioridad
  if (resetPasswordMode) {
    return <ResetPasswordScreen onComplete={clearResetMode} />
  }

  // Pantalla de carga
  if (loading || savingProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  // ── Sin sesión: flujo de adquisición ─────────────────────────────────────

  if (!session) {
    if (flowStep === 'login') {
      return (
        <AuthScreen
          selectedPlan={selectedPlan}
          onAuthSuccess={() => setFlowStep('landing')}
          loginOnly
        />
      )
    }

    if (flowStep === 'quick-onboarding') {
      return (
        <QuickOnboardingScreen
          onComplete={(data) => {
            setOnboardingData(data)
            setFlowStep('preview')
          }}
        />
      )
    }

    if (flowStep === 'preview' && onboardingData) {
      return (
        <ProtocolPreviewScreen
          data={onboardingData}
          onUnlock={() => setFlowStep('register')}
        />
      )
    }

    if (flowStep === 'register') {
      return (
        <AuthScreen
          selectedPlan={selectedPlan}
          onAuthSuccess={() => setFlowStep('landing')}
          registerOnly
        />
      )
    }

    // Landing (default)
    return (
      <LandingScreen
        onGetStarted={() => setFlowStep('quick-onboarding')}
        onLogin={() => setFlowStep('login')}
      />
    )
  }

  // ── Con sesión ────────────────────────────────────────────────────────────

  // Perfil incompleto: auto-guardado en curso (loading ya lo cubre arriba),
  // o fallback al onboarding clásico para usuarios anteriores o refresh de página
  if (!profile?.full_name) {
    return (
      <OnboardingScreen
        userId={session.user.id}
        onComplete={refreshProfile}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  // Sin suscripción activa → pago
  if (profile.subscription_status !== 'active') {
    return (
      <PaymentScreen
        userId={session.user.id}
        email={session.user.email ?? ''}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        onPaymentSuccess={refreshProfile}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  return <DashboardScreen />
}
