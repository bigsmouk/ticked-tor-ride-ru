-- Удаляем старую публичную политику SELECT
DROP POLICY IF EXISTS "Публичный доступ через view" ON public.room_players;
DROP POLICY IF EXISTS "Players can read all room players" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Новая политика: только авторизованные пользователи могут видеть участников комнат
CREATE POLICY "Только авторизованные видят участников"
ON public.room_players
FOR SELECT
USING (auth.uid() IS NOT NULL);