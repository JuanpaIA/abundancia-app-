import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { FrequenciesScreen } from '../../../src/screens/FrequenciesScreen'
import { BottomNav } from '../../../src/components/ui/BottomNav'
import { Colors } from '../../../src/constants/theme'
import { getLunarPhase, generateDailyProtocol } from '@lumina/core'
import type { ZodiacSign } from '@lumina/core'
import type { NavTab } from '../../../src/components/ui/BottomNav.types'

export default function SonidoRoute() {
  const { session, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!session || !profile?.full_name)) router.replace('/')
  }, [loading, session, profile?.full_name])

  if (loading || !session || !profile?.full_name) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  const today = new Date()
  const lunarPhase = getLunarPhase(today)
  const protocol = generateDailyProtocol(
    lunarPhase,
    profile.zodiac_sign as ZodiacSign,
    profile.numerology_number,
    profile.base_frequency,
    profile.manifestation_area
  )

  function handleNav(tab: NavTab) {
    if (tab === 'sonido') return
    if (tab === 'hoy') { router.back(); return }
    router.replace(`/${tab}` as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <FrequenciesScreen onBack={() => router.back()} todayHz={protocol.frequency.hz} />
      <BottomNav activeTab="sonido" onTabPress={handleNav} />
    </View>
  )
}
