-- Добавляем политику для кика игроков хостом
-- Хост комнаты может удалять любых игроков из своей комнаты

CREATE POLICY "Хост может кикать игроков из своей комнаты" 
ON public.room_players 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM rooms r 
    WHERE r.id = room_players.room_id 
    AND r.owner_auth_id = auth.uid()
  )
);