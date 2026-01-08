-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Create secure SELECT policy - only see players in your rooms
CREATE POLICY "Players can view room members" ON public.room_players 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.room_players rp 
    WHERE rp.room_id = room_players.room_id 
    AND rp.player_id = auth.uid()::text
  )
);