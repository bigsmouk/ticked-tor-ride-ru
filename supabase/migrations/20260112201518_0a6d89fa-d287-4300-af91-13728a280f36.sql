-- 1. PROFILES: Убираем политику "все видят всё", оставляем только свой профиль
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Создаём функцию для проверки участия в одной комнате (для просмотра профилей со-игроков)
CREATE OR REPLACE FUNCTION public.is_in_same_room(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp1
    JOIN room_players rp2 ON rp1.room_id = rp2.room_id
    JOIN profiles p ON p.id = _profile_id
    WHERE rp1.owner_auth_id = auth.uid()
      AND rp2.owner_auth_id = p.user_id
  )
$$;

-- Политика: пользователь видит свой профиль ИЛИ профили со-игроков
CREATE POLICY "Users can view own or co-player profiles"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR public.is_in_same_room(id)
);


-- 2. MATCH_HISTORY: Только матчи где пользователь участвовал
DROP POLICY IF EXISTS "Authenticated users can view match history" ON public.match_history;

-- Функция для проверки участия в матче
CREATE OR REPLACE FUNCTION public.is_match_participant(_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM match_players mp
    JOIN profiles p ON p.id = mp.profile_id
    WHERE mp.match_id = _match_id
      AND p.user_id = auth.uid()
  )
$$;

-- Политика: только участники матча видят его историю
CREATE POLICY "Users can view own match history"
ON public.match_history
FOR SELECT
USING (public.is_match_participant(id));


-- 3. MATCH_PLAYERS: Только записи своих матчей
DROP POLICY IF EXISTS "Authenticated users can view match players" ON public.match_players;

-- Политика: видит записи только из своих матчей
CREATE POLICY "Users can view players from own matches"
ON public.match_players
FOR SELECT
USING (public.is_match_participant(match_id));


-- 4. ROOMS: Публичные комнаты ИЛИ комнаты где пользователь участник/владелец
DROP POLICY IF EXISTS "Авторизованные видят комнаты" ON public.rooms;

-- Функция для проверки участия в комнате
CREATE OR REPLACE FUNCTION public.is_room_participant(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM room_players rp
    WHERE rp.room_id = _room_id
      AND rp.owner_auth_id = auth.uid()
  )
$$;

-- Политика: публичные комнаты ИЛИ свои комнаты ИЛИ комнаты где участник
CREATE POLICY "Users can view public or own rooms"
ON public.rooms
FOR SELECT
USING (
  is_private = false
  OR owner_auth_id = auth.uid()
  OR public.is_room_participant(id)
);


-- 5. PUBLIC_PROFILES: Ограничиваем доступ к view (используем security_invoker)
-- View уже должен использовать security_invoker = on, проверяем и пересоздаём
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
SELECT 
  id,
  display_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Даём права на view
GRANT SELECT ON public.public_profiles TO authenticated;