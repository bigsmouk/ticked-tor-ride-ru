-- Drop the insecure delete policy
DROP POLICY IF EXISTS "Anyone can delete rooms" ON public.rooms;

-- Create secure delete policy - only host can delete their room
CREATE POLICY "Host can delete own room" ON public.rooms 
FOR DELETE USING (host_id = (SELECT player_id FROM public.room_players WHERE room_id = rooms.id AND is_host = true LIMIT 1));