-- Create a security definer function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_players
    WHERE room_id = p_room_id
    AND player_id = auth.uid()::text
  )
$$;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;

-- Create non-recursive SELECT policy using the function
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND public.is_room_member(room_id)
);