import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Dimensions, FlatList, ActivityIndicator,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useVisionUploads, MAX_USER_UPLOADS } from '../hooks/useVisionUploads'
import type { CustomImage } from '../hooks/useVisionUploads'
import { VISION_IMAGES, VisionImage } from '@lumina/core'

const { width: SCREEN_W } = Dimensions.get('window')

interface Props { onBack: () => void }

// ── Tiles ─────────────────────────────────────────────────────────────────────

function VisionTile({ image, size }: { image: VisionImage; size: number }) {
  const [failed, setFailed] = useState(false)
  return (
    <View style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', backgroundColor: image.fallbackColor }}>
      {!failed ? (
        <Image
          source={{ uri: image.url }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: size * 0.35 }}>{image.fallbackEmoji}</Text>
        </View>
      )}
    </View>
  )
}

function CustomTile({ upload, size, onLongPress }: {
  upload: CustomImage
  size: number
  onLongPress: () => void
}) {
  if (!upload.localUri) {
    return (
      <View style={[{ width: size, height: size, borderRadius: 10, overflow: 'hidden' }, cStyles.customPlaceholder]}>
        <ActivityIndicator color={Colors.plum} size="small" />
      </View>
    )
  }
  return (
    <TouchableOpacity
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.85}
      style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden' }}
    >
      <Image source={{ uri: upload.localUri }} style={{ width: size, height: size }} resizeMode="cover" />
    </TouchableOpacity>
  )
}

function AddTile({ size, onPress, uploading, progress }: {
  size: number
  onPress: () => void
  uploading: boolean
  progress: number
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[cStyles.addTile, { width: size, height: size, borderRadius: 10 }]}
      disabled={uploading}
    >
      {uploading ? (
        <View style={{ alignItems: 'center', gap: 6 }}>
          <ActivityIndicator color={Colors.plum} size="small" />
          <Text style={cStyles.addTileLabel}>{Math.round(progress * 100)}%</Text>
        </View>
      ) : (
        <Text style={cStyles.addTileIcon}>+</Text>
      )}
    </TouchableOpacity>
  )
}

// ── Unified slideshow item ─────────────────────────────────────────────────────

type SlideItem =
  | { kind: 'predefined'; image: VisionImage }
  | { kind: 'custom'; upload: CustomImage }

// ── Main component ────────────────────────────────────────────────────────────

export function VisionBoardScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)
  const [activating, setActivating] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)

  const {
    uploads,
    loading: uploadsLoading,
    uploading,
    uploadProgress,
    upload,
    deleteUpload,
    limitReached,
  } = useVisionUploads(profile)

  const area = profile?.manifestation_area ?? 'dinero'
  const allPredefined = VISION_IMAGES[area]
  const selectedPredefined = allPredefined.filter(img => selectedIds.includes(img.id))

  // All slides: selected predefined first, then custom uploads
  const slides: SlideItem[] = [
    ...selectedPredefined.map(img => ({ kind: 'predefined' as const, image: img })),
    ...uploads.map(u => ({ kind: 'custom' as const, upload: u })),
  ]

  const hasAnyImages = slides.length > 0

  useEffect(() => {
    if (!profile) return
    const saved = profile.goal_details?.vision_board_ids
    if (saved && saved.length > 0) setSelectedIds(saved)
    setProfileLoading(false)
  }, [profile])

  async function saveSelection(ids: string[]) {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      goal_details: { ...profile.goal_details, vision_board_ids: ids },
    }).eq('id', profile.id)
    setSaving(false)
  }

  function togglePredefined(id: string) {
    setSelectedIds(prev => {
      const next = prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 12 ? [...prev, id] : prev
      saveSelection(next)
      return next
    })
  }

  function handleDeleteCustom(upload: CustomImage) {
    Alert.alert(
      'Eliminar imagen',
      '¿Eliminar esta imagen de tu tablero? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteUpload(upload.id, upload.storage_path),
        },
      ]
    )
  }

  const loading = profileLoading || uploadsLoading

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.plum} size="large" style={{ marginTop: 120 }} />
      </View>
    )
  }

  // ── Activation slideshow (fullscreen — intentionally dark/cinematic) ────────
  if (activating && slides.length > 0) {
    const item = slides[activeIndex]
    const total = slides.length
    const label = item.kind === 'predefined' ? item.image.label : (item.upload.note ?? 'Mi visión')
    const imageUri = item.kind === 'predefined'
      ? item.image.url
      : (item.upload.localUri ?? '')

    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity
          style={actStyles.overlay}
          activeOpacity={1}
          onPress={() => {
            if (activeIndex < total - 1) setActiveIndex(i => i + 1)
            else { setActivating(false); setActiveIndex(0) }
          }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: SCREEN_W, height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#111' }} />
          )}

          <LinearGradient colors={['rgba(0,0,0,0.65)', 'transparent']} style={actStyles.topScrim} pointerEvents="none" />

          <View style={actStyles.progressBars} pointerEvents="none">
            {slides.map((_, i) => (
              <View key={i} style={actStyles.progressTrack}>
                <View style={[actStyles.progressFill, {
                  backgroundColor: i < activeIndex ? Colors.gold : i === activeIndex ? Colors.purpleAccent : 'rgba(255,255,255,0.25)',
                  width: i < activeIndex ? '100%' : i === activeIndex ? '60%' : '0%',
                }]} />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={actStyles.closeBtn}
            onPress={() => { setActivating(false); setActiveIndex(0) }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={actStyles.closeText}>✕</Text>
          </TouchableOpacity>

          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={actStyles.bottomScrim} pointerEvents="none" />
          <View style={actStyles.labelBox} pointerEvents="none">
            <Text style={actStyles.counter}>{activeIndex + 1} / {total}</Text>
            <Text style={actStyles.label}>{label}</Text>
            <View style={actStyles.manifestRow}>
              <Text style={actStyles.manifestText}>✦ Visualiza · Cree · Manifiesta</Text>
            </View>
            <Text style={actStyles.hint}>Toca para continuar</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    )
  }

  // ── Selection mode (predefined images only) ───────────────────────────────
  if (selecting) {
    return (
      <View style={styles.container}>
        <View style={styles.selectHeader}>
          <TouchableOpacity onPress={() => setSelecting(false)}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.selectTitle}>Elige hasta 12 imágenes</Text>
          <Text style={styles.selectCount}>{selectedIds.length}/12</Text>
        </View>
        <FlatList
          data={allPredefined}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.selectGrid}
          columnWrapperStyle={{ gap: Spacing.sm }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => {
            const isSelected = selectedIds.includes(item.id)
            const tileSize = (SCREEN_W - Spacing.lg * 2 - Spacing.sm) / 2
            return (
              <TouchableOpacity
                onPress={() => togglePredefined(item.id)}
                activeOpacity={0.85}
                style={[selectStyles.tile, isSelected && selectStyles.tileSelected]}
              >
                <VisionTile image={item} size={tileSize} />
                {isSelected && (
                  <View style={selectStyles.checkOverlay}>
                    <Text style={selectStyles.checkmark}>✦</Text>
                  </View>
                )}
                <Text style={selectStyles.tileLabel}>{item.label}</Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    )
  }

  // ── Main board view ───────────────────────────────────────────────────────
  const tileSize = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mi Tablero de Visión</Text>
          <Text style={styles.subtitle}>Lo que manifiestas, lo que ves, lo que eres</Text>
        </View>

        {/* Empty state — no images at all */}
        {!hasAnyImages && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>Tu visión te espera</Text>
            <Text style={styles.emptyBody}>
              Selecciona imágenes predefinidas o sube las tuyas para crear tu tablero personal.
            </Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => setSelecting(true)}>
              <Text style={styles.ctaBtnText}>Elegir imágenes ✦</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaBtnSecondary} onPress={upload} disabled={uploading}>
              <Text style={styles.ctaBtnSecondaryText}>
                {uploading ? `Subiendo… ${Math.round(uploadProgress * 100)}%` : '+ Subir imagen propia'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Collage grid */}
        {hasAnyImages && (
          <>
            <View style={styles.collage}>
              {/* Predefined selected tiles */}
              {selectedPredefined.map(img => (
                <VisionTile key={img.id} image={img} size={tileSize} />
              ))}

              {/* Custom upload tiles */}
              {uploads.map(u => (
                <CustomTile
                  key={u.id}
                  upload={u}
                  size={tileSize}
                  onLongPress={() => handleDeleteCustom(u)}
                />
              ))}

              {/* Add tile */}
              {!limitReached && (
                <AddTile
                  size={tileSize}
                  onPress={upload}
                  uploading={uploading}
                  progress={uploadProgress}
                />
              )}
            </View>

            {limitReached && (
              <Text style={styles.limitNote}>
                Límite de {MAX_USER_UPLOADS} imágenes propias alcanzado. Elimina alguna para agregar una nueva.
              </Text>
            )}

            <TouchableOpacity
              style={styles.activateBtn}
              onPress={() => { setActiveIndex(0); setActivating(true) }}
              activeOpacity={0.85}
            >
              <Text style={styles.activateBtnText}>✦ Activar mi visión</Text>
            </TouchableOpacity>

            <View style={styles.editRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => setSelecting(true)}>
                <Text style={styles.editBtnText}>
                  {saving ? 'Guardando…' : `Editar predefinidas · ${selectedPredefined.length}/12`}
                </Text>
              </TouchableOpacity>
              <Text style={styles.editHint}>Mantén presionada una imagen propia para eliminarla</Text>
            </View>
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  header: { marginBottom: Spacing.xl, gap: Spacing.xs },
  back: { color: Colors.plum, fontSize: 15, marginBottom: Spacing.sm },
  title: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 13, color: Colors.textSecondary },

  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.md, paddingHorizontal: Spacing.lg },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  ctaBtn: {
    backgroundColor: Colors.plum, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  ctaBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  ctaBtnSecondary: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl,
  },
  ctaBtnSecondaryText: { fontSize: 14, color: Colors.plum, fontWeight: '600' },

  collage: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  limitNote: {
    fontSize: 12, color: Colors.textSecondary,
    textAlign: 'center', marginBottom: Spacing.md, lineHeight: 18,
  },
  activateBtn: {
    backgroundColor: Colors.plum, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activateBtnText: { fontSize: 16, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  editRow: { alignItems: 'center', gap: Spacing.xs, paddingTop: Spacing.xs },
  editBtn: { paddingVertical: Spacing.xs },
  editBtnText: { fontSize: 13, color: Colors.textDisabled },
  editHint: { fontSize: 11, color: Colors.textDim, textAlign: 'center' },

  // Selection screen
  selectHeader: {
    paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  selectTitle: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  selectCount: { fontSize: 13, color: Colors.plum, fontWeight: '700', minWidth: 30, textAlign: 'right' },
  selectGrid: { padding: Spacing.lg, paddingTop: Spacing.sm },
})

const selectStyles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  tileSelected: { borderColor: Colors.plum },
  checkOverlay: {
    position: 'absolute', top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.plum,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { fontSize: 13, color: '#fff', fontWeight: '800' },
  tileLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingTop: 4, paddingBottom: 2 },
})

const cStyles = StyleSheet.create({
  customPlaceholder: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.borderPurple,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTileIcon: {
    fontSize: 28, color: Colors.plum, fontWeight: '300', lineHeight: 34,
  },
  addTileLabel: {
    fontSize: 11, color: Colors.plum, fontFamily: Fonts.bodySemiBold,
  },
})

const actStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 2 },
  progressBars: {
    position: 'absolute', top: 54, left: Spacing.md, right: Spacing.md,
    flexDirection: 'row', gap: 4, zIndex: 3,
  },
  progressTrack: { flex: 1, height: 2.5, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%' as any, borderRadius: 2 },
  closeBtn: {
    position: 'absolute', top: 72, right: Spacing.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  closeText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, zIndex: 2 },
  labelBox: { position: 'absolute', bottom: 56, left: Spacing.lg, right: Spacing.lg, alignItems: 'center', gap: 6, zIndex: 3 },
  counter: { fontFamily: Fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  label: {
    fontFamily: Fonts.headingSemiBold, fontSize: 26, color: '#fff',
    textAlign: 'center', lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  manifestRow: { flexDirection: 'row', alignItems: 'center' },
  manifestText: { fontFamily: Fonts.bodyMedium, fontSize: 12, color: Colors.gold, opacity: 0.8, letterSpacing: 0.5 },
  hint: { fontFamily: Fonts.body, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
})
