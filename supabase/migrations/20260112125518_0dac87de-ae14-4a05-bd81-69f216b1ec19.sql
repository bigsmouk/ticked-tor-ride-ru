-- 1. PROFILES: пользователь видит только свой профиль
DROP POLICY IF EXISTS "Авторизованные видят профили" ON public.profiles;

CREATE POLICY "Пользователь видит только свой профиль"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. ROOMS: только авторизованные пользователи видят комнаты
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.rooms;

CREATE POLICY "Авторизованные видят комнаты"
ON public.rooms
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Ограничиваем INSERT для rooms тоже
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;

CREATE POLICY "Авторизованные создают комнаты"
ON public.rooms
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND owner_auth_id = auth.uid());

-- 3. MATCH_PLAYERS: INSERT только для владельца комнаты (через match_history.room_id -> rooms.owner_auth_id)
DROP POLICY IF EXISTS "Система может создавать записи уч" ON public.match_players;

CREATE POLICY "Владелец матча создаёт записи участников"
ON public.match_players
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.match_history mh
    JOIN public.rooms r ON r.id = mh.room_id
    WHERE mh.id = match_id
    AND r.owner_auth_id = auth.uid()
  )
  OR
  -- Для матчей без привязки к комнате - только авторизованный
  (
    NOT EXISTS (
      SELECT 1 FROM public.match_history mh
      WHERE mh.id = match_id AND mh.room_id IS NOT NULL
    )
    AND auth.uid() IS NOT NULL
  )
);