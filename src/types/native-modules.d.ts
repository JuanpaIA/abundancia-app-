// Type stubs for native-only packages installed under apps/mobile
// These packages are only available at runtime on native; web variants are handled separately.

declare module 'expo-blur' {
  import type { ViewProps } from 'react-native'
  export interface BlurViewProps extends ViewProps {
    intensity?: number
    tint?: 'light' | 'dark' | 'default' | 'systemUltraThinMaterial' | 'systemThinMaterial' | 'systemMaterial' | 'systemThickMaterial' | 'systemChromeMaterial' | 'systemUltraThinMaterialLight' | 'systemThinMaterialLight' | 'systemMaterialLight' | 'systemThickMaterialLight' | 'systemChromeMaterialLight' | 'systemUltraThinMaterialDark' | 'systemThinMaterialDark' | 'systemMaterialDark' | 'systemThickMaterialDark' | 'systemChromeMaterialDark'
    experimentalBlurMethod?: 'dimezisBlurView' | 'none'
  }
  export const BlurView: React.FC<BlurViewProps>
}

declare module '@react-native-masked-view/masked-view' {
  import type { ViewProps } from 'react-native'
  export interface MaskedViewProps extends ViewProps {
    maskElement: React.ReactElement
  }
  const MaskedView: React.FC<MaskedViewProps>
  export default MaskedView
}
