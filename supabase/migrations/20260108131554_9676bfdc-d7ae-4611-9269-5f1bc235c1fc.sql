-- Drop old permissive policies
DROP POLICY IF EXISTS "Players can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Players can update own status" ON public.room_players;
DROP POLICY IF EXISTS "Players can leave rooms" ON public.room_players;

-- Create secure policies using auth.uid()
CREATE POLICY "Authenticated users can join rooms" ON public.room_players 
FOR INSERT WITH CHECK (player_id = auth.uid()::text);

CREATE POLICY "Players can update own status" ON public.room_players 
FOR UPDATE USING (player_id = auth.uid()::text);

CREATE POLICY "Players can leave rooms" ON public.room_players 
FOR DELETE USING (player_id = auth.uid()::text);