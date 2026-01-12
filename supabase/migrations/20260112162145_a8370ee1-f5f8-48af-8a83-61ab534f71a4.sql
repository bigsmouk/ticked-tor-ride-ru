-- Fix match_players: restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "Любой может видеть участников" ON public.match_players;

CREATE POLICY "Authenticated users can view match players" 
ON public.match_players 
FOR SELECT 
TO authenticated
USING (true);

-- Fix profiles: ensure SELECT is restricted to authenticated users
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Только авторизованные видят публи" ON public.profiles;

-- The policy "Пользователь видит свой профиль" already exists for owner access
-- Add a policy for authenticated users to see basic public profile info
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);