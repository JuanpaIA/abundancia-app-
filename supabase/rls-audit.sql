-- RLS AUDIT — Lumina
-- Ejecutar en el SQL Editor del dashboard de Supabase.
-- IMPORTANTE: Revisa primero si ya existen políticas con estos nombres para evitar duplicados.
-- security-patch.sql (UPDATE de profiles) se mantiene separado — no lo reimplementes aquí.

-- ── Helper: is_admin() ────────────────────────────────────────────────────────
-- Función SECURITY DEFINER para evitar recursión cuando las políticas de profiles
-- necesitan verificar si el usuario es admin leyendo profiles.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLA: profiles
-- UPDATE ya está cubierto por security-patch.sql con sus WITH CHECK restrictivos.
-- SELECT: usuario lee solo su perfil; admin lee todos.
-- INSERT: no se permite desde el cliente (lo crea el trigger de auth.users o la edge function admin-user-actions).
-- DELETE: no se permite desde el cliente (lo ejecuta la edge function delete-account con service_role).
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario lee solo su perfil" ON public.profiles;
CREATE POLICY "Usuario lee solo su perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLA: daily_logs
-- SELECT: usuario ve solo sus registros; admin ve todos (panel de administración).
-- INSERT: usuario inserta solo sus propios registros.
-- UPDATE: usuario actualiza solo sus propios registros.
-- DELETE: no se permite desde el cliente.
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario lee solo sus registros diarios" ON public.daily_logs;
CREATE POLICY "Usuario lee solo sus registros diarios"
  ON public.daily_logs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Usuario inserta solo sus registros diarios" ON public.daily_logs;
CREATE POLICY "Usuario inserta solo sus registros diarios"
  ON public.daily_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario actualiza solo sus registros diarios" ON public.daily_logs;
CREATE POLICY "Usuario actualiza solo sus registros diarios"
  ON public.daily_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLA: journal_entries
-- SELECT / INSERT / UPDATE / DELETE: usuario opera solo sobre sus entradas.
-- No hay panel admin que acceda a journal_entries directamente.
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario lee solo sus entradas de diario" ON public.journal_entries;
CREATE POLICY "Usuario lee solo sus entradas de diario"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario inserta solo sus entradas de diario" ON public.journal_entries;
CREATE POLICY "Usuario inserta solo sus entradas de diario"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario actualiza solo sus entradas de diario" ON public.journal_entries;
CREATE POLICY "Usuario actualiza solo sus entradas de diario"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuario elimina solo sus entradas de diario" ON public.journal_entries;
CREATE POLICY "Usuario elimina solo sus entradas de diario"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLA: vision_board_uploads
-- SELECT: usuario ve solo sus propias entradas (evita que una usuaria liste rutas de otra).
-- INSERT: usuario inserta solo con su propio user_id.
-- DELETE: usuario elimina solo sus propias entradas.
-- UPDATE: no se permite (los registros son inmutables; se borran y re-insertan).
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.vision_board_uploads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuaria lee solo sus uploads" ON public.vision_board_uploads;
CREATE POLICY "Usuaria lee solo sus uploads"
  ON public.vision_board_uploads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuaria inserta solo sus uploads" ON public.vision_board_uploads;
CREATE POLICY "Usuaria inserta solo sus uploads"
  ON public.vision_board_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuaria elimina solo sus uploads" ON public.vision_board_uploads;
CREATE POLICY "Usuaria elimina solo sus uploads"
  ON public.vision_board_uploads FOR DELETE
  USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════════════════════════════════════
-- TABLA: error_reports
-- INSERT: solo usuarios autenticados pueden insertar, con su propio user_id o null.
--   NOTA: los errores pre-autenticación (AuthScreen con user_id: null) quedan
--   silenciados por RLS — son visibles en los logs de Supabase pero no en la tabla.
--   Es el trade-off correcto: evitar que actores anónimos spameen la tabla.
-- SELECT: solo admins (panel de administración).
-- UPDATE: solo admins (marcar como resuelto).
-- DELETE: no se permite.
-- ══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuario autenticado inserta error_reports" ON public.error_reports;
CREATE POLICY "Usuario autenticado inserta error_reports"
  ON public.error_reports FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin lee error_reports" ON public.error_reports;
CREATE POLICY "Admin lee error_reports"
  ON public.error_reports FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin actualiza error_reports" ON public.error_reports;
CREATE POLICY "Admin actualiza error_reports"
  ON public.error_reports FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ══════════════════════════════════════════════════════════════════════════════
-- STORAGE: storage.objects — bucket "vision-boards"
-- Requisito: el bucket debe existir como PRIVADO en el dashboard de Supabase.
-- Las políticas de storage se aplican sobre storage.objects (tabla de Supabase Storage).
-- Cada política filtra por bucket_id y verifica que la carpeta raíz del path
-- coincida con el uid del usuario autenticado ({user_id}/{filename}).
--
-- SELECT: la usuaria ve solo sus propias imágenes.
-- INSERT: la usuaria sube solo a su propia carpeta.
-- UPDATE: necesario para upsert ({upsert:true}) — reemplaza el archivo si ya existe.
-- DELETE: la usuaria borra solo sus propias imágenes.
-- ══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Leer propias imágenes"        ON storage.objects;
DROP POLICY IF EXISTS "Subir propias imágenes"        ON storage.objects;
DROP POLICY IF EXISTS "Reemplazar propias imágenes"   ON storage.objects;
DROP POLICY IF EXISTS "Borrar propias imágenes"       ON storage.objects;

CREATE POLICY "Leer propias imágenes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'vision-boards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

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


-- ══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK — ejecutar completo si algo se rompe al aplicar lo anterior
-- ══════════════════════════════════════════════════════════════════════════════

/*
DROP FUNCTION IF EXISTS public.is_admin();

-- profiles
DROP POLICY IF EXISTS "Usuario lee solo su perfil"              ON public.profiles;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- daily_logs
DROP POLICY IF EXISTS "Usuario lee solo sus registros diarios"  ON public.daily_logs;
DROP POLICY IF EXISTS "Usuario inserta solo sus registros diarios" ON public.daily_logs;
DROP POLICY IF EXISTS "Usuario actualiza solo sus registros diarios" ON public.daily_logs;
ALTER TABLE public.daily_logs DISABLE ROW LEVEL SECURITY;

-- journal_entries
DROP POLICY IF EXISTS "Usuario lee solo sus entradas de diario"    ON public.journal_entries;
DROP POLICY IF EXISTS "Usuario inserta solo sus entradas de diario" ON public.journal_entries;
DROP POLICY IF EXISTS "Usuario actualiza solo sus entradas de diario" ON public.journal_entries;
DROP POLICY IF EXISTS "Usuario elimina solo sus entradas de diario"  ON public.journal_entries;
ALTER TABLE public.journal_entries DISABLE ROW LEVEL SECURITY;

-- vision_board_uploads
DROP POLICY IF EXISTS "Usuaria lee solo sus uploads"    ON public.vision_board_uploads;
DROP POLICY IF EXISTS "Usuaria inserta solo sus uploads" ON public.vision_board_uploads;
DROP POLICY IF EXISTS "Usuaria elimina solo sus uploads" ON public.vision_board_uploads;
ALTER TABLE public.vision_board_uploads DISABLE ROW LEVEL SECURITY;

-- error_reports
DROP POLICY IF EXISTS "Usuario autenticado inserta error_reports" ON public.error_reports;
DROP POLICY IF EXISTS "Admin lee error_reports"                   ON public.error_reports;
DROP POLICY IF EXISTS "Admin actualiza error_reports"             ON public.error_reports;
ALTER TABLE public.error_reports DISABLE ROW LEVEL SECURITY;

-- storage.objects (vision-boards)
DROP POLICY IF EXISTS "Leer propias imágenes"        ON storage.objects;
DROP POLICY IF EXISTS "Subir propias imágenes"        ON storage.objects;
DROP POLICY IF EXISTS "Reemplazar propias imágenes"   ON storage.objects;
DROP POLICY IF EXISTS "Borrar propias imágenes"       ON storage.objects;
*/
