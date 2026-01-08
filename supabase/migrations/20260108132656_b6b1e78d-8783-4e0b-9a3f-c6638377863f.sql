-- Drop the public SELECT policy
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;

-- Create secure SELECT policy - only authenticated users can view rooms
CREATE POLICY "Authenticated users can view rooms" ON public.rooms 
FOR SELECT USING (auth.uid() IS NOT NULL);