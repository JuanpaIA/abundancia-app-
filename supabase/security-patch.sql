-- PARCHE DE SEGURIDAD v2: Proteger columnas sensibles en profiles
--
-- Fix: plan_start_date ahora se puede escribir cuando es NULL (onboarding)
-- pero no puede cambiar si ya tiene un valor (solo el webhook puede hacerlo).
-- is_admin y subscription_status siguen bloqueados siempre desde el cliente.

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
    -- plan_start_date: se puede escribir si estaba vacío (onboarding), pero no cambiar después
    AND (
      (SELECT plan_start_date FROM public.profiles WHERE id = auth.uid()) IS NULL
      OR plan_start_date IS NOT DISTINCT FROM (SELECT plan_start_date FROM public.profiles WHERE id = auth.uid())
    )
    -- stripe_customer_id solo lo escribe create-checkout
    AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM public.profiles WHERE id = auth.uid())
  );
