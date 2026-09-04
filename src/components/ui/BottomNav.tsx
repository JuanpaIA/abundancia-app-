import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { Colors, Fonts } from '../../constants/theme'
import type { BottomNavProps, NavTab } from './BottomNav.types'

const STROKE = { strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function IconHoy({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke={color} {...STROKE} />
    </Svg>
  )
}

function IconDiario({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} {...STROKE} />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} {...STROKE} />
    </Svg>
  )
}

function IconVision({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={2} stroke={color} {...STROKE} />
      <Circle cx={9} cy={9} r={1.8} stroke={color} {...STROKE} />
      <Path d="M21 15l-5-5L5 21" stroke={color} {...STROKE} />
    </Svg>
  )
}

function IconSonido({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l12-2v13" stroke={color} {...STROKE} />
      <Circle cx={6} cy={18} r={3} stroke={color} {...STROKE} />
      <Circle cx={18} cy={16} r={3} stroke={color} {...STROKE} />
    </Svg>
  )
}

function IconPerfil({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} {...STROKE} />
      <Path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={color} {...STROKE} />
    </Svg>
  )
}

const TABS: { key: NavTab; label: string; Icon: React.FC<{ color: string }> }[] = [
  { key: 'hoy',    label: 'Hoy',    Icon: IconHoy    },
  { key: 'diario', label: 'Diario', Icon: IconDiario },
  { key: 'vision', label: 'Visión', Icon: IconVision },
  { key: 'sonido', label: 'Sonido', Icon: IconSonido },
  { key: 'perfil', label: 'Perfil', Icon: IconPerfil },
]

export function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key
          const color = active ? Colors.goldLight : Colors.textDim
          return (
            <TouchableOpacity
              key={key}
              style={styles.item}
              onPress={() => onTabPress(key)}
              activeOpacity={0.7}
            >
              <Icon color={color} />
              <Text style={[styles.label, { color }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    height: 64,
    backgroundColor: 'rgba(10,10,20,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    // @ts-ignore — web only
    backdropFilter: 'blur(20px)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bodySemiBold,
    letterSpacing: 0.2,
  },
})
