import { useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../src/services/supabase'
import { useAuth } from '../src/hooks/useAuth'
import { LandingScreen } from '../src/screens/LandingScreen'
import { PlanSelectionScreen } from '../src/screens/PlanSelectionScreen'
import { AuthScreen } from '../src/screens/AuthScreen'
import { OnboardingScreen } from '../src/screens/OnboardingScreen'
import { DashboardScreen } from '../src/screens/DashboardScreen'
import { PaymentScreen } from '../src/screens/PaymentScreen'
import { ResetPasswordScreen } from '../src/screens/ResetPasswordScreen'
import { Colors } from '../src/constants/theme'
import { PlanType } from '../src/types'

type NewUserStep = 'plans' | 'auth' | 'login' | null

export default function Index() {
  const { session, profile, loading, refreshProfile, resetPasswordMode, clearResetMode } = useAuth()
  const [newUserStep, setNewUserStep] = useState<NewUserStep>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly')
  const [changingPlan, setChangingPlan] = useState(false)

  // Recuperación de contraseña — máxima prioridad, intercepta cualquier otro estado
  if (resetPasswordMode) {
    return <ResetPasswordScreen onComplete={clearResetMode} />
  }

  // Pantalla de carga mientras resuelve la sesión
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  // Usuario sin sesión — flujo de adquisición
  if (!session) {
    if (newUserStep === 'plans') {
      return (
        <PlanSelectionScreen
          onSelectPlan={(plan) => {
            setSelectedPlan(plan)
            setNewUserStep('auth')
          }}
        />
      )
    }
    if (newUserStep === 'auth') {
      return (
        <AuthScreen
          selectedPlan={selectedPlan}
          onAuthSuccess={() => setNewUserStep(null)}
        />
      )
    }
    if (newUserStep === 'login') {
      return (
        <AuthScreen
          selectedPlan={selectedPlan}
          onAuthSuccess={() => setNewUserStep(null)}
          loginOnly
        />
      )
    }
    return (
      <LandingScreen
        onGetStarted={() => setNewUserStep('plans')}
        onLogin={() => setNewUserStep('login')}
      />
    )
  }

  // Usuario con sesión pero sin perfil completo — onboarding
  if (!profile?.full_name) {
    return (
      <OnboardingScreen
        userId={session.user.id}
        onComplete={refreshProfile}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  // Usuario con perfil pero sin suscripción activa — pago
  if (profile.subscription_status !== 'active') {
    if (changingPlan) {
      return (
        <PlanSelectionScreen
          onSelectPlan={async (plan) => {
            setSelectedPlan(plan)
            await supabase.from('profiles').update({ plan_type: plan }).eq('id', session.user.id)
            await refreshProfile()
            setChangingPlan(false)
          }}
        />
      )
    }
    return (
      <PaymentScreen
        userId={session.user.id}
        email={session.user.email ?? ''}
        planType={profile.plan_type ?? selectedPlan}
        onPaymentSuccess={refreshProfile}
        onChangePlan={() => setChangingPlan(true)}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  // Usuario registrado, con perfil y suscripción activa — dashboard
  return <DashboardScreen />
}
