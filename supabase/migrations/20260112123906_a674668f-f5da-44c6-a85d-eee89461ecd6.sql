-- Добавляем колонку для привязки записи к авторизованному пользователю
ALTER TABLE public.room_players 
ADD COLUMN IF NOT EXISTS owner_auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Удаляем старые небезопасные политики
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can update status" ON public.room_players;
DROP POLICY IF EXISTS "Anyone can leave rooms" ON public.room_players;

-- INSERT: авторизованный пользователь может присоединиться и owner_auth_id должен быть его
CREATE POLICY "Игрок может присоединиться к комнате"
ON public.room_players
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (owner_auth_id = auth.uid() OR owner_auth_id IS NULL)
);

-- UPDATE: только владелец записи может её обновлять
CREATE POLICY "Игрок может обновлять свою запись"
ON public.room_players
FOR UPDATE
USING (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
)
WITH CHECK (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
);

-- DELETE: только владелец записи может её удалять (покинуть комнату)
CREATE POLICY "Игрок может покинуть комнату"
ON public.room_players
FOR DELETE
USING (
  owner_auth_id IS NOT NULL AND owner_auth_id = auth.uid()
);

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_room_players_owner_auth_id ON public.room_players(owner_auth_id);