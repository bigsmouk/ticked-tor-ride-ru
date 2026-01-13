-- Drop the old restrictive policy that conflicts
DROP POLICY IF EXISTS "Пользователь видит свой профиль" ON public.profiles;

-- Update is_in_same_room function to work correctly
CREATE OR REPLACE FUNCTION public.is_in_same_room(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp1
    JOIN room_players rp2 ON rp1.room_id = rp2.room_id
    JOIN profiles p ON p.id = _profile_id
    WHERE rp1.owner_auth_id = auth.uid()
      AND rp2.owner_auth_id = p.user_id
      AND rp1.id != rp2.id  -- Ensure we're checking different players
  )
$$;