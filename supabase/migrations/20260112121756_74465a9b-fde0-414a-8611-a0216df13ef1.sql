-- Разрешаем пользователям удалять свои записи из истории матчей
CREATE POLICY "Пользователь может удалять свои записи" ON public.match_players 
FOR DELETE USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);