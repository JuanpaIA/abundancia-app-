import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, usePathname } from 'expo-router'
import { Colors, Fonts } from '../../../src/constants/theme'

export const TAB_BAR_HEIGHT = 64

const TABS: {
  key: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  iconActive: keyof typeof Ionicons.glyphMap
}[] = [
  { key: '/',       label: 'Hoy',    icon: 'moon-outline',          iconActive: 'moon'           },
  { key: '/diario', label: 'Diario', icon: 'book-outline',          iconActive: 'book'           },
  { key: '/vision', label: 'Visión', icon: 'image-outline',         iconActive: 'image'          },
  { key: '/sonido', label: 'Sonido', icon: 'musical-notes-outline', iconActive: 'musical-notes'  },
  { key: '/perfil', label: 'Perfil', icon: 'person-circle-outline', iconActive: 'person-circle'  },
]

export function BottomTabBar() {
  const router = useRouter()
  const pathname = usePathname()

  function handleTabPress(tabKey: string) {
    if (tabKey === pathname) return

    if (pathname === '/') {
      router.push(tabKey as any)
    } else if (tabKey === '/') {
      router.back()
    } else {
      router.replace(tabKey as any)
    }
  }

  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const active = pathname === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {active && <View style={styles.indicator} />}
            <Ionicons
              name={active ? tab.iconActive : tab.icon}
              size={22}
              color={active ? Colors.gold : 'rgba(240,236,228,0.35)'}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    backgroundColor: Colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingBottom: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingTop: 6,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: 'rgba(240,236,228,0.35)',
    fontFamily: Fonts.bodySemiBold,
  },
  labelActive: {
    color: Colors.gold,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 1,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
})
