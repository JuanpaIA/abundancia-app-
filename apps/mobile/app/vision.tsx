import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { VisionBoardScreen } from '../../../src/screens/VisionBoardScreen'
import { BottomNav } from '../../../src/components/ui/BottomNav'
import { Colors } from '../../../src/constants/theme'
import type { NavTab } from '../../../src/components/ui/BottomNav.types'

export default function VisionRoute() {
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

  function handleNav(tab: NavTab) {
    if (tab === 'vision') return
    if (tab === 'hoy') { router.back(); return }
    router.replace(`/${tab}` as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <VisionBoardScreen onBack={() => router.back()} />
      <BottomNav activeTab="vision" onTabPress={handleNav} />
    </View>
  )
}
