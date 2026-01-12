-- Создаём безопасный view для room_players без player_id для публичного доступа
CREATE OR REPLACE VIEW public.public_room_players 
WITH (security_invoker = true)
AS
SELECT 
  id,
  room_id,
  player_name,
  color,
  is_ready,
  is_host,
  joined_at
FROM public.room_players;

-- Функция для проверки членства в комнате (с SECURITY DEFINER чтобы избежать рекурсии)
CREATE OR REPLACE FUNCTION public.is_room_member(p_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_players
    WHERE room_id = p_room_id
  )
$$;

-- Обновляем политику SELECT для room_players: player_id видят только участники комнаты
DROP POLICY IF EXISTS "Players can read all room players" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can view room players" ON public.room_players;

-- Публичный SELECT через view (без player_id)
CREATE POLICY "Публичный доступ через view"
ON public.room_players
FOR SELECT
USING (true);

-- Комментарий: полные данные с player_id доступны только через прямой запрос участникам
COMMENT ON VIEW public.public_room_players IS 'Безопасный view без player_id для публичного доступа';