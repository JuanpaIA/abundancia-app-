import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Modal, Dimensions, FlatList, ActivityIndicator,
} from 'react-native'
import { Colors, Spacing, Radius } from '../constants/theme'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { VISION_IMAGES, VisionImage } from '../content/visionBoardImages'

const { width: SCREEN_W } = Dimensions.get('window')

interface Props { onBack: () => void }

function VisionTile({ image, size, onError }: { image: VisionImage; size: number; onError?: () => void }) {
  const [failed, setFailed] = useState(false)
  return (
    <View style={[{ width: size, height: size, borderRadius: 10, overflow: 'hidden', backgroundColor: image.fallbackColor }]}>
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

export function VisionBoardScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)
  const [activating, setActivating] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const area = profile?.manifestation_area ?? 'dinero'
  const allImages = VISION_IMAGES[area]
  const selectedImages = allImages.filter(img => selectedIds.includes(img.id))

  useEffect(() => {
    if (!profile) return
    const saved = (profile.goal_details as any)?.vision_board_ids as string[] | undefined
    if (saved && saved.length > 0) setSelectedIds(saved)
    setLoading(false)
  }, [profile])

  async function saveSelection(ids: string[]) {
    if (!profile) return
    setSaving(true)
    await supabase.from('profiles').update({
      goal_details: { ...profile.goal_details, vision_board_ids: ids },
    }).eq('id', profile.id)
    setSaving(false)
  }

  function toggleImage(id: string) {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 12 ? [...prev, id] : prev
      saveSelection(next)
      return next
    })
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 120 }} />
      </View>
    )
  }

  // ── Pantalla de activación (slideshow fullscreen) ─────────────────────────
  if (activating && selectedImages.length > 0) {
    const img = selectedImages[activeIndex]
    return (
      <Modal visible transparent animationType="fade" statusBarTranslucent>
        <TouchableOpacity
          style={actStyles.overlay}
          activeOpacity={1}
          onPress={() => {
            if (activeIndex < selectedImages.length - 1) setActiveIndex(i => i + 1)
            else { setActivating(false); setActiveIndex(0) }
          }}
        >
          <VisionTile image={img} size={SCREEN_W} />
          <View style={actStyles.overlay2}>
            <View style={actStyles.labelBox}>
              <Text style={actStyles.label}>{img.label}</Text>
              <Text style={actStyles.hint}>Toca para continuar</Text>
            </View>
            <View style={actStyles.dots}>
              {selectedImages.map((_, i) => (
                <View key={i} style={[actStyles.dot, i === activeIndex && actStyles.dotActive]} />
              ))}
            </View>
          </View>
          <TouchableOpacity style={actStyles.closeBtn} onPress={() => { setActivating(false); setActiveIndex(0) }}>
            <Text style={actStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    )
  }

  // ── Modal de selección de imágenes ────────────────────────────────────────
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
          data={allImages}
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
                onPress={() => toggleImage(item.id)}
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

  // ── Vista principal del tablero ───────────────────────────────────────────
  const tileSize = (SCREEN_W - Spacing.lg * 2 - Spacing.sm * 2) / 3

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mi Tablero de Visión</Text>
          <Text style={styles.subtitle}>Lo que manifiestas, lo que ves, lo que eres</Text>
        </View>

        {/* Empty state */}
        {selectedImages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>Tu visión te espera</Text>
            <Text style={styles.emptyBody}>
              Selecciona imágenes que representen lo que quieres manifestar. Verlas cada día activa tu mente para atraerlo.
            </Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => setSelecting(true)}>
              <Text style={styles.ctaBtnText}>Construir mi visión ✦</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Collage grid */}
        {selectedImages.length > 0 && (
          <>
            <View style={styles.collage}>
              {selectedImages.map(img => (
                <VisionTile key={img.id} image={img} size={tileSize} />
              ))}
            </View>

            {/* Activate button */}
            <TouchableOpacity
              style={styles.activateBtn}
              onPress={() => { setActiveIndex(0); setActivating(true) }}
              activeOpacity={0.85}
            >
              <Text style={styles.activateBtnText}>✦ Activar mi visión</Text>
            </TouchableOpacity>

            {/* Edit button */}
            <TouchableOpacity style={styles.editBtn} onPress={() => setSelecting(true)}>
              <Text style={styles.editBtnText}>
                {saving ? 'Guardando…' : `Editar selección · ${selectedImages.length}/12`}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  )
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  header: { marginBottom: Spacing.xl, gap: Spacing.xs },
  back: { color: Colors.gold, fontSize: 15, marginBottom: Spacing.sm },
  title: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 13, color: Colors.textSecondary },

  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.md, paddingHorizontal: Spacing.lg },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  emptyBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  ctaBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  ctaBtnText: { fontSize: 16, color: Colors.background, fontWeight: '700' },

  collage: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  activateBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.lg,
    paddingVertical: Spacing.md, alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  activateBtnText: { fontSize: 16, color: Colors.background, fontWeight: '700', letterSpacing: 0.5 },
  editBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  editBtnText: { fontSize: 13, color: Colors.textDisabled },

  // Selection screen
  selectHeader: {
    paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  selectTitle: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  selectCount: { fontSize: 13, color: Colors.gold, fontWeight: '700', minWidth: 30, textAlign: 'right' },
  selectGrid: { padding: Spacing.lg, paddingTop: Spacing.sm },
})

const selectStyles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  tileSelected: { borderColor: Colors.gold },
  checkOverlay: {
    position: 'absolute', top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  checkmark: { fontSize: 13, color: Colors.background, fontWeight: '800' },
  tileLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', paddingTop: 4, paddingBottom: 2 },
})

const actStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  overlay2: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  labelBox: { alignItems: 'center', gap: 6, marginBottom: Spacing.lg },
  label: { fontSize: 24, color: '#fff', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  hint: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: Colors.gold, width: 18 },
  closeBtn: { position: 'absolute', top: 54, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, color: '#fff' },
})
