-- Fix infinite recursion in profiles RLS policies.
--
-- The previous "Admins gerenciam perfis" policy on public.profiles did a
-- subquery against public.profiles itself, which re-triggered RLS evaluation
-- and produced "infinite recursion detected in policy for relation profiles".
-- That caused every authenticated read on profiles (including the post-login
-- status check) to return HTTP 500, blocking sign-in for all users.
--
-- Resolution: move the admin check into a SECURITY DEFINER function so the
-- inner SELECT bypasses RLS, and reference it from the policy.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins gerenciam perfis" ON public.profiles;

CREATE POLICY "Admins gerenciam perfis"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
