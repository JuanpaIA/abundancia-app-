import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import 'react-native-reanimated'
import * as Notifications from 'expo-notifications'
import { useFonts } from 'expo-font'
import {
  Cormorant_500Medium,
  Cormorant_500Medium_Italic,
  Cormorant_600SemiBold,
  Cormorant_700Bold,
} from '@expo-google-fonts/cormorant'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'

import { Colors } from '../../../src/constants/theme'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cormorant_500Medium,
    Cormorant_500Medium_Italic,
    Cormorant_600SemiBold,
    Cormorant_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.gold} size="large" />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </>
  )
}
