import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../src/services/supabase'
import { useAuth } from '../src/hooks/useAuth'
import { LandingScreen } from '../src/screens/LandingScreen'
import { SignedOutScreen } from '../src/screens/SignedOutScreen'
import { AuthScreen } from '../src/screens/AuthScreen'
import { ManifestationIntakeScreen } from '../src/screens/ManifestationIntakeScreen'
import { OnboardingScreen } from '../src/screens/OnboardingScreen'
import { DashboardScreen } from '../src/screens/DashboardScreen'
import { PaymentScreen } from '../src/screens/PaymentScreen'
import { ProtocolPreviewScreen } from '../src/screens/ProtocolPreviewScreen'
import { ResetPasswordScreen } from '../src/screens/ResetPasswordScreen'
import { BottomNav } from '../src/components/ui/BottomNav'
import { Ensamblaje } from '../src/components/Ensamblaje'
import { SignalReveal } from '../src/components/ui/SignalReveal'
import { Colors } from '../src/constants/theme'
import { CREATOR_MODE } from '../src/constants/creatorMode'
import { resetSignalCounter } from '../src/hooks/useSignalCounter'
import { OnboardingData, PlanType } from '@lumina/core'
import type { NavTab } from '../src/components/ui/BottomNav.types'
import type { AlignmentTier, SignalResult } from '@lumina/core'

const DEV_SIGNAL_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33] as const

function makeDevSignal(num: number): SignalResult {
  const master = num === 11 || num === 22 || num === 33
  return {
    number: num,
    reading: master
      ? `El número maestro ${num} activa un canal de percepción distinto.`
      : `Haz algo hoy que no estaba en ningún plan tuyo.`,
    expanded: `Segundo bloque del texto expandido para el número ${num}. Verifica el fade-in y el layout en distintos tamaños de pantalla antes de integrar la Parte 3.`,
  }
}

// Cross-platform storage helpers
function storedGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return Promise.resolve((globalThis as any).localStorage?.getItem(key) ?? null) } catch { return Promise.resolve(null) }
  }
  return Promise.resolve(null)
}
function storedSet(key: string, value: string): void {
  if (Platform.OS === 'web') {
    try { (globalThis as any).localStorage?.setItem(key, value) } catch {}
  }
}
function storedRemove(key: string): void {
  if (Platform.OS === 'web') {
    try { (globalThis as any).localStorage?.removeItem(key) } catch {}
  }
}

export const NAV_HEIGHT = 64

type FlowStep = 'landing' | 'onboarding' | 'intake' | 'preview' | 'register' | 'login'

export default function Index() {
  const { session, profile, loading, refreshProfile, resetPasswordMode, clearResetMode } = useAuth()
  const router = useRouter()

  const [flowStep,            setFlowStep]            = useState<FlowStep>('landing')
  const [onboardingData,      setOnboardingData]      = useState<OnboardingData | null>(null)
  const [selectedPlan,        setSelectedPlan]        = useState<PlanType>('monthly')
  const [savingProfile,       setSavingProfile]       = useState(false)
  const [showDailyEnsamblaje, setShowDailyEnsamblaje] = useState(false)
  const [signedOut,           setSignedOut]           = useState(false)
  const [signedOutName,       setSignedOutName]       = useState<string | undefined>()

  // __DEV__ only
  const [devForceTier,    setDevForceTier]    = useState<AlignmentTier | null>(null)
  const [devOpen,         setDevOpen]         = useState(false)
  const [devSignalNum,    setDevSignalNum]    = useState<number>(7)
  const [devSignalVisible, setDevSignalVisible] = useState(false)
  const [devCreatorMode,  setDevCreatorMode]  = useState(false)
  const [counterRefreshKey, setCounterRefreshKey] = useState(0)
  const [devSegmentOverride, setDevSegmentOverride] = useState<'manana' | 'tarde' | 'noche' | null>(null)

  // Show Ensamblaje once per day
  useEffect(() => {
    if (!session || !profile?.full_name) return
    const todayStr = new Date().toISOString().split('T')[0]
    storedGet('ensamblaje_last_shown').then(stored => {
      if (stored !== todayStr) setShowDailyEnsamblaje(true)
    })
  }, [session?.user.id, profile?.full_name])

  // Auto-save profile after registration with onboarding data
  useEffect(() => {
    if (!session || !profile || profile.full_name || !onboardingData || savingProfile) return
    setSavingProfile(true)
    const today = new Date().toISOString().split('T')[0]
    supabase.from('profiles').update({
      full_name:          onboardingData.name,
      birth_date:         onboardingData.birthDate,
      zodiac_sign:        onboardingData.zodiac,
      numerology_number:  onboardingData.numerology,
      base_frequency:     onboardingData.frequency,
      manifestation_area: onboardingData.manifestationArea,
      goal_details:       onboardingData.goalDetails ?? {},
      plan_duration:      30,
      plan_start_date:    today,
    }).eq('id', session.user.id).then(({ error }) => {
      if (!error) refreshProfile()
      setSavingProfile(false)
    })
  }, [session?.user.id, profile?.full_name])

  const handleSignOut = async () => {
    const name = profile?.full_name ?? undefined
    await supabase.auth.signOut()
    setSignedOutName(name)
    setSignedOut(true)
  }

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

  // ── Signed-out confirmation ──────────────────────────────────────────────────

  if (!session && signedOut) {
    return (
      <SignedOutScreen
        userName={signedOutName}
        onSignIn={() => { setSignedOut(false); setFlowStep('login') }}
        onExplore={() => { setSignedOut(false); setFlowStep('landing') }}
      />
    )
  }

  // ── Unauthenticated flow ─────────────────────────────────────────────────────

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
    if (flowStep === 'onboarding') {
      return (
        <OnboardingScreen
          onComplete={(data) => { if (data) { setOnboardingData(data); setFlowStep('intake') } }}
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
          onBack={() => setFlowStep('onboarding')}
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
    return (
      <LandingScreen
        onGetStarted={() => setFlowStep('onboarding')}
        onLogin={() => setFlowStep('login')}
      />
    )
  }

  // ── Incomplete profile ───────────────────────────────────────────────────────

  if (!profile?.full_name) {
    if (onboardingData) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      )
    }
    return (
      <OnboardingScreen
        userId={session.user.id}
        onComplete={refreshProfile}
        onSignOut={handleSignOut}
      />
    )
  }

  // ── No active subscription ───────────────────────────────────────────────────

  if (profile.subscription_status !== 'active') {
    return (
      <PaymentScreen
        userId={session.user.id}
        email={session.user.email ?? ''}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        onPaymentSuccess={refreshProfile}
        onSignOut={handleSignOut}
      />
    )
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────

  function handleNavTab(tab: NavTab) {
    if (tab === 'hoy') return
    router.push(`/${tab}` as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <DashboardScreen
        bottomInset={NAV_HEIGHT}
        creatorMode={__DEV__ ? devCreatorMode : CREATOR_MODE}
        counterRefreshKey={counterRefreshKey}
        segmentOverride={__DEV__ ? devSegmentOverride ?? undefined : undefined}
      />
      <BottomNav activeTab="hoy" onTabPress={handleNavTab} />

      {/* Daily Ensamblaje overlay */}
      {showDailyEnsamblaje && (
        <Ensamblaje
          name={profile.full_name}
          birthDate={profile.birth_date}
          zodiac={profile.zodiac_sign}
          numerology={profile.numerology_number}
          frequency={profile.base_frequency}
          manifestationArea={profile.manifestation_area}
          forceTier={devForceTier ?? undefined}
          creatorMode={__DEV__ ? devCreatorMode : CREATOR_MODE}
          onComplete={() => {
            storedSet('ensamblaje_last_shown', new Date().toISOString().split('T')[0])
            setShowDailyEnsamblaje(false)
          }}
        />
      )}

      {/* SignalReveal overlay — DEV preview */}
      <SignalReveal
        signal={makeDevSignal(devSignalNum)}
        alignmentScore={72}
        alignmentTier="action"
        visible={devSignalVisible}
        onDismiss={() => setDevSignalVisible(false)}
        creatorMode={devCreatorMode}
      />

      {/* ── DEV panel ─────────────────────────────────────────────────────────── */}
      {__DEV__ && (
        <View style={devStyles.root}>
          <TouchableOpacity onPress={() => setDevOpen(o => !o)} style={devStyles.toggle}>
            <Text style={devStyles.toggleText}>⚙</Text>
          </TouchableOpacity>
          {devOpen && (
            <View style={devStyles.panel}>
              <Text style={devStyles.heading}>DEV</Text>

              <TouchableOpacity
                style={devStyles.btn}
                onPress={() => {
                  storedRemove('ensamblaje_last_shown')
                  setShowDailyEnsamblaje(true)
                }}
              >
                <Text style={devStyles.btnText}>Relanzar Ensamblaje</Text>
              </TouchableOpacity>

              <Text style={devStyles.label}>Forzar tier:</Text>
              <View style={devStyles.tierRow}>
                {(['action', 'building', 'reception'] as AlignmentTier[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[devStyles.tierBtn, devForceTier === t && devStyles.tierBtnActive]}
                    onPress={() => setDevForceTier(prev => prev === t ? null : t)}
                  >
                    <Text style={[devStyles.tierBtnText, devForceTier === t && devStyles.tierBtnTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {devForceTier && (
                <Text style={devStyles.hint}>Abre el Ensamblaje para ver el tier forzado</Text>
              )}

              <Text style={[devStyles.label, { marginTop: 8 }]}>Señal — número forzado:</Text>
              <View style={devStyles.numGrid}>
                {DEV_SIGNAL_NUMS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[devStyles.numBtn, devSignalNum === n && devStyles.numBtnActive]}
                    onPress={() => setDevSignalNum(n)}
                  >
                    <Text style={[devStyles.numBtnText, devSignalNum === n && devStyles.numBtnTextActive]}>
                      {n}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[devStyles.btn, { marginTop: 2 }]}
                onPress={() => setDevSignalVisible(true)}
              >
                <Text style={devStyles.btnText}>Disparar Señal {devSignalNum}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[devStyles.btn, { marginTop: 8, backgroundColor: devCreatorMode ? 'rgba(236,203,122,0.22)' : undefined }]}
                onPress={() => setDevCreatorMode(m => !m)}
              >
                <Text style={devStyles.btnText}>Creator Mode: {devCreatorMode ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[devStyles.btn, { marginTop: 4 }]}
                onPress={async () => {
                  await resetSignalCounter()
                  setCounterRefreshKey(k => k + 1)
                }}
              >
                <Text style={devStyles.btnText}>Resetear contador señales</Text>
              </TouchableOpacity>

              {/* Segment override */}
              <Text style={[devStyles.btnText, { marginTop: 10, opacity: 0.5, fontSize: 9 }]}>SEGMENTO</Text>
              {(['manana', 'tarde', 'noche', null] as const).map(seg => (
                <TouchableOpacity
                  key={String(seg)}
                  style={[devStyles.btn, { marginTop: 4, backgroundColor: devSegmentOverride === seg ? 'rgba(167,139,250,0.22)' : undefined }]}
                  onPress={() => setDevSegmentOverride(seg)}
                >
                  <Text style={devStyles.btnText}>{seg === null ? 'Auto (tiempo real)' : seg.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

const devStyles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 60,
    right: 12,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  toggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,80,80,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontSize: 16, color: '#fff' },
  panel: {
    marginTop: 6,
    backgroundColor: 'rgba(20,10,30,0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
    padding: 12,
    gap: 8,
    minWidth: 180,
  },
  heading: { fontSize: 10, color: 'rgba(255,80,80,0.9)', fontWeight: '700', letterSpacing: 2 },
  btn: {
    backgroundColor: 'rgba(255,80,80,0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  btnText: { fontSize: 12, color: '#ff9090', fontWeight: '600' },
  label: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  tierRow: { flexDirection: 'row', gap: 6 },
  tierBtn: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  tierBtnActive: { borderColor: '#eccb7a', backgroundColor: 'rgba(236,203,122,0.15)' },
  tierBtnText:   { fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  tierBtnTextActive: { color: '#eccb7a', fontWeight: '700' },
  hint: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  numGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  numBtn: {
    width: 34,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnActive:     { borderColor: '#eccb7a', backgroundColor: 'rgba(236,203,122,0.15)' },
  numBtnText:       { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  numBtnTextActive: { color: '#eccb7a', fontWeight: '700' },
})
