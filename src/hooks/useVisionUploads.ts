import { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native'
import { supabase } from '../services/supabase'
import { pickImage } from '../utils/pickImage'
import { getCachedUri, cacheLocalFile, evictCachedFile } from '../utils/imageCache'
import type { UserProfile } from '@lumina/core'

export const MAX_USER_UPLOADS = 30

export interface CustomImage {
  id: string
  storage_path: string
  note: string | null
  created_at: string
  localUri: string | null  // null while resolving / if download failed
}

async function getSignedUrl(storagePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('vision-boards')
    .createSignedUrl(storagePath, 3600)
  if (error || !data) return null
  return data.signedUrl
}

export function useVisionUploads(profile: UserProfile | null) {
  const [uploads, setUploads] = useState<CustomImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!profile) return

    let cancelled = false

    async function loadUploads() {
      setLoading(true)

      const { data, error } = await supabase
        .from('vision_board_uploads')
        .select('id, storage_path, note, created_at')
        .eq('user_id', profile!.id)
        .order('created_at', { ascending: true })

      if (cancelled) return
      if (error || !data) { setLoading(false); return }

      // Resolve local URIs in parallel; failures yield null (shown as broken tile)
      const resolved = await Promise.all(
        data.map(async (row) => {
          const localUri = await getCachedUri(row.id, row.storage_path, getSignedUrl)
          return { ...row, localUri }
        })
      )

      if (!cancelled) {
        setUploads(resolved)
        setLoading(false)
      }
    }

    loadUploads()
    return () => { cancelled = true }
  }, [profile?.id])

  // ── Upload ────────────────────────────────────────────────────────────────
  const upload = useCallback(async () => {
    if (!profile) return

    if (uploads.length >= MAX_USER_UPLOADS) {
      Alert.alert(
        'Límite alcanzado',
        `Puedes tener hasta ${MAX_USER_UPLOADS} imágenes propias en tu tablero. Elimina alguna para agregar una nueva.`
      )
      return
    }

    const picked = await pickImage()
    if (!picked) return

    setUploading(true)
    setUploadProgress(0.1)

    let storagePath: string | null = null

    try {
      const uuid = crypto.randomUUID()
      storagePath = `${profile.id}/${uuid}.jpg`

      // Fetch as blob (works on both native and web)
      const response = await fetch(picked.uri)
      const blob = await response.blob()
      setUploadProgress(0.3)

      const { error: storageError } = await supabase.storage
        .from('vision-boards')
        .upload(storagePath, blob, { contentType: 'image/jpeg', upsert: false })

      if (storageError) throw storageError
      setUploadProgress(0.7)

      const { data, error: dbError } = await supabase
        .from('vision_board_uploads')
        .insert({ user_id: profile.id, storage_path: storagePath })
        .select('id, storage_path, note, created_at')
        .single()

      if (dbError) {
        // Rollback: remove orphaned storage object
        await supabase.storage.from('vision-boards').remove([storagePath])
        throw dbError
      }

      setUploadProgress(0.9)

      // Cache locally so it's immediately available without re-download
      const localUri = await cacheLocalFile(data.id, picked.uri)
      setUploadProgress(1)

      setUploads(prev => [...prev, { ...data, localUri }])
    } catch {
      Alert.alert(
        'Error al subir',
        'No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.',
        [{ text: 'OK' }]
      )
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [profile, uploads.length])

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteUpload = useCallback(async (id: string, storagePath: string) => {
    const { error: storageError } = await supabase.storage
      .from('vision-boards')
      .remove([storagePath])

    if (storageError) {
      Alert.alert('Error', 'No se pudo eliminar la imagen. Inténtalo de nuevo.')
      return
    }

    await supabase
      .from('vision_board_uploads')
      .delete()
      .eq('id', id)

    await evictCachedFile(id)
    setUploads(prev => prev.filter(u => u.id !== id))
  }, [])

  return {
    uploads,
    loading,
    uploading,
    uploadProgress,
    upload,
    deleteUpload,
    limitReached: uploads.length >= MAX_USER_UPLOADS,
  }
}
