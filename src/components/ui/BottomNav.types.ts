export type NavTab = 'hoy' | 'diario' | 'vision' | 'sonido' | 'perfil'

export interface BottomNavProps {
  activeTab: NavTab
  onTabPress: (tab: NavTab) => void
}
