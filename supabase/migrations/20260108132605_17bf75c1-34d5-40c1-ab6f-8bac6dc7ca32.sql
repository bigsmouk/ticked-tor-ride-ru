-- Drop the old policies with circular dependency
DROP POLICY IF EXISTS "Host can update own room" ON public.rooms;
DROP POLICY IF EXISTS "Host can delete own room" ON public.rooms;

-- Create secure policies with direct auth check
CREATE POLICY "Host can update own room" ON public.rooms 
FOR UPDATE USING (host_id = auth.uid()::text);

CREATE POLICY "Host can delete own room" ON public.rooms 
FOR DELETE USING (host_id = auth.uid()::text);