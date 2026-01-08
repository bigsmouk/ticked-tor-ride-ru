-- Drop the current SELECT policy
DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;

-- Create secure SELECT policy - only authenticated users in the same room can view
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.room_players rp 
    WHERE rp.room_id = room_players.room_id 
    AND rp.player_id = auth.uid()::text
  )
);