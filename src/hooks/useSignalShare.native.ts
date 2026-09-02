// Native — captures an off-screen SignalShareCard view and shares it via the
// system sheet. The caller must render <SignalShareCard ref={cardRef} /> in the
// component tree (off-screen) so view-shot can capture it.
//
// captureRef fires synchronously against the already-rendered native view.
// expo-sharing opens the OS share sheet with the PNG file.

import { useCallback, useRef } from 'react'
import { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import type { SignalResult } from '@lumina/core'
import type { SignalShareHook } from './useSignalShare'

export function useSignalShare(
  signal: SignalResult,
  _alignmentScore: number,
  _alignmentTier: string,
): SignalShareHook {
  const cardRef = useRef<View>(null)

  const share = useCallback(async () => {
    if (!cardRef.current) return
    try {
      // Capture the off-screen card at device pixel ratio (3× on modern iPhones →
      // 1080×1920 output from a 360×640 view)
      const uri = await captureRef(cardRef, {
        format:  'png',
        quality: 1.0,
        result:  'tmpfile',
      })

      const available = await Sharing.isAvailableAsync()
      if (!available) return

      await Sharing.shareAsync(uri, {
        mimeType:    'image/png',
        UTI:         'public.png',
        dialogTitle: 'Comparte tu señal',
      })
    } catch (err) {
      if (__DEV__) console.warn('[useSignalShare] native capture/share failed:', err)
    }
  }, [signal])

  return { share, cardRef }
}
