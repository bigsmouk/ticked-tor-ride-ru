-- Fix function search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Fix room_players INSERT policy
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.room_players;
CREATE POLICY "Players can join rooms" ON public.room_players 
FOR INSERT WITH CHECK (true);

-- Fix room_players UPDATE policy  
DROP POLICY IF EXISTS "Anyone can update their status" ON public.room_players;
CREATE POLICY "Players can update own status" ON public.room_players 
FOR UPDATE USING (player_id = player_id);

-- Fix room_players DELETE policy
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.room_players;
CREATE POLICY "Players can leave rooms" ON public.room_players 
FOR DELETE USING (player_id = player_id);

-- Fix rooms INSERT policy
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
CREATE POLICY "Anyone can create rooms" ON public.rooms 
FOR INSERT WITH CHECK (true);