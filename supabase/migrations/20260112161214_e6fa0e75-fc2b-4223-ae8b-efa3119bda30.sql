-- Drop the overly permissive public SELECT policy on match_history
DROP POLICY IF EXISTS "Любой может видеть историю матчей" ON public.match_history;

-- Create a new policy that only allows authenticated users to view match history
CREATE POLICY "Authenticated users can view match history" 
ON public.match_history 
FOR SELECT 
TO authenticated
USING (true);