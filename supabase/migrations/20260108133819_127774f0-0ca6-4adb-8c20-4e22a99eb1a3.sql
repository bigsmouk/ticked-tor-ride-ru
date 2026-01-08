-- Drop current restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON public.rooms;
DROP POLICY IF EXISTS "Host can update own room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete own room" ON public.rooms;

DROP POLICY IF EXISTS "Players can view room members" ON public.room_players;
DROP POLICY IF EXISTS "Authenticated users can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Players can update own status" ON public.room_players;
DROP POLICY IF EXISTS "Players can leave rooms" ON public.room_players;

-- Simple policies for rooms - public access
CREATE POLICY "Anyone can view rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON public.rooms FOR DELETE USING (true);

-- Simple policies for room_players - public access
CREATE POLICY "Anyone can view room players" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.room_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update status" ON public.room_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.room_players FOR DELETE USING (true);