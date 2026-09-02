import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../../src/hooks/useAuth'
import { ProfileScreen } from '../../../src/screens/ProfileScreen'
import { BottomNav } from '../../../src/components/ui/BottomNav'
import { MiniPlayer } from '../../../src/components/ui/MiniPlayer'
import { Colors } from '../../../src/constants/theme'
import type { NavTab } from '../../../src/components/ui/BottomNav.types'

const NAV_HEIGHT = 64

export default function PerfilRoute() {
  const { session, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!session || !profile?.full_name)) router.replace('/')
  }, [loading, session, profile?.full_name])

  if (loading || !session || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  function handleNav(tab: NavTab) {
    if (tab === 'perfil') return
    if (tab === 'hoy') { router.back(); return }
    router.replace(`/${tab}` as any)
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ProfileScreen bottomInset={NAV_HEIGHT} />
      <MiniPlayer />
      <BottomNav activeTab="perfil" onTabPress={handleNav} />
    </View>
  )
}
