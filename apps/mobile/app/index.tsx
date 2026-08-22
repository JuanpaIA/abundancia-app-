import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../../../src/services/supabase'
import { useAuth } from '../../../src/hooks/useAuth'
import { AuthScreen } from '../../../src/screens/AuthScreen'
import { QuickOnboardingScreen } from '../../../src/screens/QuickOnboardingScreen'
import { ManifestationIntakeScreen } from '../../../src/screens/ManifestationIntakeScreen'
import { OnboardingScreen } from '../../../src/screens/OnboardingScreen'
import { DashboardScreen } from '../../../src/screens/DashboardScreen'
import { ProtocolPreviewScreen } from '../../../src/screens/ProtocolPreviewScreen'
import { ResetPasswordScreen } from '../../../src/screens/ResetPasswordScreen'
import { Colors } from '../../../src/constants/theme'
import { OnboardingData } from '@lumina/core'

// LandingScreen and PaymentScreen are excluded from mobile:
//   - LandingScreen: web marketing only
//   - PaymentScreen: Stripe web flow — added in Phase 3b (IAP / RevenueCat)

type FlowStep = 'quick-onboarding' | 'intake' | 'preview' | 'register' | 'login'

export default function Index() {
  const { session, profile, loading, refreshProfile, resetPasswordMode, clearResetMode } = useAuth()

  const [flowStep, setFlowStep] = useState<FlowStep>('quick-onboarding')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Auto-save onboarding data when a new user registers
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
      goal_details: onboardingData.goalDetails ?? {},
      plan_duration: 30,
      plan_start_date: today,
    }).eq('id', session.user.id).then(({ error }) => {
      if (!error) refreshProfile()
      setSavingProfile(false)
    })
  }, [session?.user.id, profile?.full_name])

  // Password recovery — highest priority
  if (resetPasswordMode) {
    return <ResetPasswordScreen onComplete={clearResetMode} />
  }

  if (loading || savingProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  // ── No session: acquisition flow (no Landing on mobile) ──────────────────

  if (!session) {
    if (flowStep === 'login') {
      return (
        <AuthScreen
          selectedPlan="monthly"
          onAuthSuccess={() => setFlowStep('quick-onboarding')}
          loginOnly
        />
      )
    }

    if (flowStep === 'quick-onboarding') {
      return (
        <QuickOnboardingScreen
          onComplete={(data) => {
            setOnboardingData(data)
            setFlowStep('intake')
          }}
        />
      )
    }

    if (flowStep === 'intake' && onboardingData) {
      return (
        <ManifestationIntakeScreen
          area={onboardingData.manifestationArea}
          onComplete={(goalDetails) => {
            setOnboardingData((prev: OnboardingData | null) => prev ? { ...prev, goalDetails } : null)
            setFlowStep('preview')
          }}
          onBack={() => setFlowStep('quick-onboarding')}
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
          selectedPlan="monthly"
          onAuthSuccess={() => setFlowStep('quick-onboarding')}
          registerOnly
        />
      )
    }

    // Fallback: start from the beginning
    return (
      <QuickOnboardingScreen
        onComplete={(data) => {
          setOnboardingData(data)
          setFlowStep('intake')
        }}
      />
    )
  }

  // ── With session ──────────────────────────────────────────────────────────

  if (!profile?.full_name) {
    return (
      <OnboardingScreen
        userId={session.user.id}
        onComplete={refreshProfile}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  // TODO(3b): gate inactive subscriptions behind IAP / RevenueCat paywall.
  // For Phase 3a, all authenticated users with a profile go straight to Dashboard.

  return <DashboardScreen />
}
