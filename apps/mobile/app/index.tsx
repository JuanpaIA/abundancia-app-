import { useState, useEffect } from 'react'
import { View, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../../../src/services/supabase'
import { useAuth } from '../../../src/hooks/useAuth'
import { AuthScreen } from '../../../src/screens/AuthScreen'
import { QuickOnboardingScreen } from '../../../src/screens/QuickOnboardingScreen'
import { ManifestationIntakeScreen } from '../../../src/screens/ManifestationIntakeScreen'
import { OnboardingScreen } from '../../../src/screens/OnboardingScreen'
import { DashboardScreen } from '../../../src/screens/DashboardScreen'
import { ProtocolPreviewScreen } from '../../../src/screens/ProtocolPreviewScreen'
import { ResetPasswordScreen } from '../../../src/screens/ResetPasswordScreen'
import { BottomNav } from '../../../src/components/ui/BottomNav'
import { Ensamblaje } from '../../../src/components/Ensamblaje'
import { Colors } from '../../../src/constants/theme'
import { CREATOR_MODE } from '../../../src/constants/creatorMode'
import { OnboardingData } from '@lumina/core'

// TODO [Fase 3b — IAP]: Mobile dashboard is accessible with session + full_name only.
// subscription_status NOT checked → app effectively free for all logged-in users.
// Add subscription check when native IAP is implemented.
// DO NOT close gate before IAP is ready.
import type { NavTab } from '../../../src/components/ui/BottomNav.types'

// Cross-platform storage: SecureStore on native, localStorage on web
async function storedGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return (globalThis as any).localStorage?.getItem(key) ?? null } catch { return null }
  }
  return SecureStore.getItemAsync(key).catch(() => null)
}
function storedSet(key: string, value: string): void {
  if (Platform.OS === 'web') {
    try { (globalThis as any).localStorage?.setItem(key, value) } catch {}
    return
  }
  SecureStore.setItemAsync(key, value).catch(() => {})
}

const NAV_HEIGHT = 64

type FlowStep = 'quick-onboarding' | 'intake' | 'ensamblaje' | 'preview' | 'register' | 'login'

export default function Index() {
  const { session, profile, loading, refreshProfile, resetPasswordMode, clearResetMode } = useAuth()
  const router = useRouter()

  const [flowStep,             setFlowStep]             = useState<FlowStep>('quick-onboarding')
  const [onboardingData,       setOnboardingData]       = useState<OnboardingData | null>(null)
  const [savingProfile,        setSavingProfile]        = useState(false)
  const [showDailyEnsamblaje,  setShowDailyEnsamblaje]  = useState(false)

  // Show Ensamblaje once per day (works on both native and web)
  useEffect(() => {
    if (!session || !profile?.full_name) return
    const todayStr = new Date().toISOString().split('T')[0]
    storedGet('ensamblaje_last_shown').then(stored => {
      if (stored !== todayStr) setShowDailyEnsamblaje(true)
    })
  }, [session?.user.id, profile?.full_name])

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

  if (!session) {
    if (flowStep === 'login') {
      return <AuthScreen selectedPlan="monthly" onAuthSuccess={() => setFlowStep('quick-onboarding')} loginOnly />
    }
    if (flowStep === 'quick-onboarding') {
      return <QuickOnboardingScreen onComplete={(data) => { setOnboardingData(data); setFlowStep('intake') }} />
    }
    if (flowStep === 'intake' && onboardingData) {
      return (
        <ManifestationIntakeScreen
          area={onboardingData.manifestationArea}
          onComplete={(goalDetails) => {
            setOnboardingData((prev: OnboardingData | null) => prev ? { ...prev, goalDetails } : null)
            setFlowStep('ensamblaje')
          }}
          onBack={() => setFlowStep('quick-onboarding')}
        />
      )
    }
    if (flowStep === 'ensamblaje' && onboardingData) {
      return (
        <Ensamblaje
          name={onboardingData.name}
          birthDate={onboardingData.birthDate}
          zodiac={onboardingData.zodiac}
          numerology={onboardingData.numerology}
          frequency={onboardingData.frequency}
          manifestationArea={onboardingData.manifestationArea}
          creatorMode={CREATOR_MODE}
          onComplete={() => setFlowStep('preview')}
        />
      )
    }
    if (flowStep === 'preview' && onboardingData) {
      return <ProtocolPreviewScreen data={onboardingData} onUnlock={() => setFlowStep('register')} />
    }
    if (flowStep === 'register') {
      return <AuthScreen selectedPlan="monthly" onAuthSuccess={() => setFlowStep('quick-onboarding')} registerOnly />
    }
    return <QuickOnboardingScreen onComplete={(data) => { setOnboardingData(data); setFlowStep('intake') }} />
  }

  if (!profile?.full_name) {
    return (
      <OnboardingScreen
        userId={session.user.id}
        onComplete={refreshProfile}
        onSignOut={async () => { await supabase.auth.signOut() }}
      />
    )
  }

  function handleNavTab(tab: NavTab) {
    if (tab === 'hoy') return
    router.push(`/${tab}` as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <DashboardScreen bottomInset={NAV_HEIGHT} creatorMode={CREATOR_MODE} />
      <BottomNav activeTab="hoy" onTabPress={handleNavTab} />
      {showDailyEnsamblaje && (
        <Ensamblaje
          name={profile.full_name}
          birthDate={profile.birth_date}
          zodiac={profile.zodiac_sign}
          numerology={profile.numerology_number}
          frequency={profile.base_frequency}
          manifestationArea={profile.manifestation_area}
          creatorMode={CREATOR_MODE}
          onComplete={() => {
            storedSet('ensamblaje_last_shown', new Date().toISOString().split('T')[0])
            setShowDailyEnsamblaje(false)
          }}
        />
      )}
    </View>
  )
}
