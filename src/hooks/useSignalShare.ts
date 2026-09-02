// Web — HTML5 Canvas generates the 1080×1920 story image and triggers download.
// Metro resolves useSignalShare.native.ts on iOS/Android automatically.

import { useCallback } from 'react'
import type React from 'react'
import type { SignalResult } from '@lumina/core'

export interface SignalShareHook {
  share: () => void | Promise<void>
  // Native only: ref to the off-screen SignalShareCard view for captureRef
  cardRef?: React.RefObject<any>
}

const TIER_COLOR: Record<string, string> = {
  action:    '#eccb7a',
  building:  '#c4aff7',
  reception: '#c8d6ec',
}

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export function useSignalShare(
  signal: SignalResult,
  alignmentScore: number,
  alignmentTier: string,
): SignalShareHook {
  const share = useCallback(() => {
    try {
      const W = 1080, H = 1920
      const canvas = document.createElement('canvas')
      canvas.width  = W
      canvas.height = H
      const ctx = canvas.getContext('2d')!

      // ── Background gradient ──────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H)
      bg.addColorStop(0,    '#170c30')
      bg.addColorStop(0.55, '#120a26')
      bg.addColorStop(1,    '#0a0814')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Purple ambient orb top-right
      const orb1 = ctx.createRadialGradient(W * 0.85, H * 0.07, 0, W * 0.85, H * 0.07, 340)
      orb1.addColorStop(0, 'rgba(100,60,180,0.20)')
      orb1.addColorStop(1, 'rgba(100,60,180,0)')
      ctx.fillStyle = orb1
      ctx.fillRect(0, 0, W, H)

      // Gold ambient orb bottom-left
      const orb2 = ctx.createRadialGradient(W * 0.15, H * 0.88, 0, W * 0.15, H * 0.88, 280)
      orb2.addColorStop(0, 'rgba(212,168,67,0.10)')
      orb2.addColorStop(1, 'rgba(212,168,67,0)')
      ctx.fillStyle = orb2
      ctx.fillRect(0, 0, W, H)

      // ── Scattered particles ─────────────────────────────────────────────────
      const seed = signal.number * 137 + alignmentScore * 31
      for (let i = 0; i < 48; i++) {
        const px = ((seed * (i + 7) * 1009) % W + W) % W
        const py = (seed * (i + 3) * 1013) % (H * 0.55) + H * 0.04
        const r  = ((seed * i * 7) % 3) + 1
        const op = 0.12 + (((seed * i * 11) % 20) / 100)
        ctx.beginPath()
        ctx.arc(px, py, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212,168,67,${op.toFixed(2)})`
        ctx.fill()
      }

      // ── Moon (center-top) ───────────────────────────────────────────────────
      const moonCX = W / 2, moonCY = 440, moonR = 190
      const moonColor = TIER_COLOR[alignmentTier] ?? '#eccb7a'

      // Outline
      ctx.beginPath()
      ctx.arc(moonCX, moonCY, moonR - 3, 0, Math.PI * 2)
      ctx.strokeStyle = moonColor + '55'
      ctx.lineWidth   = 3
      ctx.stroke()

      // Fill from bottom
      const fillRatio = Math.max(0, Math.min(1, (alignmentScore - 45) / 53))
      ctx.save()
      ctx.beginPath()
      ctx.arc(moonCX, moonCY, moonR - 3, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = moonColor + '38'
      const fillH = fillRatio * moonR * 2
      ctx.fillRect(moonCX - moonR, moonCY + moonR - fillH, moonR * 2, fillH)
      // Waterline
      if (fillH > 4) {
        ctx.fillStyle = moonColor + '99'
        ctx.fillRect(moonCX - moonR, moonCY + moonR - fillH, moonR * 2, 3)
      }
      ctx.restore()

      // Score inside moon
      ctx.fillStyle    = moonColor
      ctx.font         = `700 ${Math.round(moonR * 0.55)}px serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(alignmentScore), moonCX, moonCY)

      // ── Number — absolute hero ──────────────────────────────────────────────
      const numStr  = String(signal.number)
      const isMaster = signal.number === 11 || signal.number === 22 || signal.number === 33
      const numSize  = numStr.length > 1 ? 272 : 316

      ctx.font         = `700 ${numSize}px serif`
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'alphabetic'

      // Glow layer
      ctx.shadowColor  = isMaster ? 'rgba(236,203,122,0.55)' : 'rgba(236,203,122,0.28)'
      ctx.shadowBlur   = isMaster ? 80 : 40
      ctx.fillStyle    = '#eccb7a'
      ctx.fillText(numStr, W / 2, 900)
      ctx.shadowBlur   = 0

      // ── Reading text ────────────────────────────────────────────────────────
      ctx.font         = `400 52px sans-serif`
      ctx.fillStyle    = 'rgba(240,236,228,0.92)'
      ctx.textBaseline = 'top'
      const maxTxtW    = W - 200
      const lines      = wrapText(ctx, `"${signal.reading}"`, maxTxtW)
      const lineH      = 76
      const blockH     = lines.length * lineH
      let   lineY      = 970 + (lines.length === 1 ? 28 : 0)
      for (const ln of lines) {
        ctx.fillText(ln, W / 2, lineY)
        lineY += lineH
      }

      // ── Divider ─────────────────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(212,168,67,0.28)'
      ctx.lineWidth   = 1.5
      ctx.beginPath()
      ctx.moveTo(W / 2 - 72, 1780)
      ctx.lineTo(W / 2 + 72, 1780)
      ctx.stroke()

      // ── Wordmark + domain ───────────────────────────────────────────────────
      ctx.textBaseline = 'alphabetic'
      ctx.font         = `700 58px serif`
      ctx.fillStyle    = 'rgba(212,168,67,0.85)'
      ctx.fillText('LUMINA', W / 2, 1848)

      ctx.font      = `400 34px sans-serif`
      ctx.fillStyle = 'rgba(212,168,67,0.38)'
      ctx.fillText('lumina.app', W / 2, 1896)

      // ── Download ────────────────────────────────────────────────────────────
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a   = document.createElement('a')
        a.href     = url
        a.download = `lumina-señal-${signal.number}.png`
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
      }, 'image/png')

    } catch (err) {
      if (__DEV__) console.warn('[useSignalShare] canvas failed:', err)
    }
  }, [signal, alignmentScore, alignmentTier])

  return { share }
}
