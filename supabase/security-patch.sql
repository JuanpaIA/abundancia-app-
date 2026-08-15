-- PARCHE DE SEGURIDAD: Proteger columnas sensibles en profiles contra modificación directa
--
-- Problema: la política UPDATE anterior no tenía WITH CHECK, lo que permitía
-- a cualquier usuario autenticado escribir is_admin=true o subscription_status='active'
-- en su propio perfil usando el anon key directamente.
--
-- Fix: agregar WITH CHECK que bloquea cambios a columnas críticas.
-- El usuario puede seguir actualizando: full_name, goal_details, push_token,
-- manifestation_area, plan_type y otros campos de perfil normales.

DROP POLICY IF EXISTS "Usuario actualiza solo su perfil" ON public.profiles;

CREATE POLICY "Usuario actualiza solo su perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- is_admin nunca puede cambiar desde el cliente
    AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    -- subscription_status solo lo cambia el webhook de Stripe
    AND subscription_status = (SELECT subscription_status FROM public.profiles WHERE id = auth.uid())
    -- plan_start_date solo lo escribe el server
    AND plan_start_date IS NOT DISTINCT FROM (SELECT plan_start_date FROM public.profiles WHERE id = auth.uid())
    -- stripe_customer_id solo lo escribe create-checkout
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
  );
