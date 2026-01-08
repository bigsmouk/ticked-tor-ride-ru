-- Drop the insecure update policy
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;

-- Create secure update policy - only host can update their room
CREATE POLICY "Host can update own room" ON public.rooms 
FOR UPDATE USING (host_id = (SELECT player_id FROM public.room_players WHERE room_id = rooms.id AND is_host = true LIMIT 1));