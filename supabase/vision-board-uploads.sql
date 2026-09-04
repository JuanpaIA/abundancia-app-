-- ── vision_board_uploads ─────────────────────────────────────────────────────
-- Ejecutar en el dashboard de Supabase (SQL Editor).
-- Paso 1: tabla
-- Paso 2: RLS en la tabla
-- Paso 3: bucket + políticas de Storage (sección Storage en el dashboard)

-- ── Tabla ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.vision_board_uploads (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT        NOT NULL,   -- ej: "{user_id}/{uuid}.jpg"
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vision_board_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuaria lee solo sus uploads"
  ON public.vision_board_uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuaria inserta solo sus uploads"
  ON public.vision_board_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuaria elimina solo sus uploads"
  ON public.vision_board_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- ── Storage ───────────────────────────────────────────────────────────────────
-- Requisito previo: crear el bucket "vision-boards" como PRIVADO
-- en Storage → New bucket del dashboard de Supabase.
-- Luego ejecuta este bloque (idempotente con DROP IF EXISTS):

DROP POLICY IF EXISTS "Leer propias imágenes"   ON storage.objects;
DROP POLICY IF EXISTS "Subir propias imágenes"   ON storage.objects;
DROP POLICY IF EXISTS "Reemplazar propias imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Borrar propias imágenes"  ON storage.objects;

CREATE POLICY "Leer propias imágenes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- INSERT cubre uploads nuevos; UPDATE cubre upsert ({upsert: true})
CREATE POLICY "Subir propias imágenes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Reemplazar propias imágenes"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Borrar propias imágenes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
