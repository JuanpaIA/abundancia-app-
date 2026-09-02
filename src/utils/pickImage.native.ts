import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { Alert, Linking } from 'react-native'

export interface PickedImage {
  uri: string
  mimeType: 'image/jpeg'
}

export async function pickImage(): Promise<PickedImage | null> {
  const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync()

  if (status === 'denied' && !canAskAgain) {
    Alert.alert(
      'Acceso a galería bloqueado',
      'Para agregar imágenes a tu tablero, permite el acceso a tu galería desde Ajustes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
      ]
    )
    return null
  }

  if (status !== 'granted') {
    const { status: asked } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (asked !== 'granted') return null
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 1,
  })

  if (result.canceled) return null
  const asset = result.assets[0]

  // Resize to max 1200px on the longest side, compress to JPEG 0.8
  const { width, height } = asset
  const maxDim = 1200
  const ratio = Math.min(maxDim / width, maxDim / height, 1)
  const actions = ratio < 1
    ? [{ resize: { width: Math.round(width * ratio), height: Math.round(height * ratio) } }]
    : []

  const manipulated = await manipulateAsync(asset.uri, actions, {
    compress: 0.8,
    format: SaveFormat.JPEG,
  })

  return { uri: manipulated.uri, mimeType: 'image/jpeg' }
}
