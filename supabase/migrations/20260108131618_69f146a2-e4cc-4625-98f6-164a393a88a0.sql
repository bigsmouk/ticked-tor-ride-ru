-- Fix rooms INSERT policy to require auth
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
CREATE POLICY "Authenticated users can create rooms" ON public.rooms 
FOR INSERT WITH CHECK (host_id = auth.uid()::text);