-- 1. Create a public-safe view for rooms that hides internal identifiers
CREATE OR REPLACE VIEW public.public_rooms WITH (security_invoker = on) AS
SELECT 
  id,
  name,
  code,
  is_private,
  max_players,
  status,
  created_at,
  updated_at
  -- Intentionally excluding: host_id, owner_auth_id (sensitive internal identifiers)
FROM public.rooms
WHERE is_private = false AND status = 'waiting';

-- 2. Drop existing public_profiles view and recreate with proper security
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles WITH (security_invoker = on) AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
  -- Intentionally excluding: user_id (sensitive internal identifier)
FROM public.profiles;

-- 3. Grant access to the views for authenticated users
GRANT SELECT ON public.public_rooms TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;

-- 4. Revoke anonymous access to sensitive views
REVOKE ALL ON public.public_rooms FROM anon;
REVOKE ALL ON public.public_profiles FROM anon;